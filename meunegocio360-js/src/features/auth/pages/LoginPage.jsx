import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, Card, Container, Form, Spinner } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router";
import brandLogo from "../../../../../assets/logo_meunegocio360_v2_sem_fundo.png";
import { ApiError } from "../../../shared/lib/http.js";
import { safeInternalPath } from "../../../shared/lib/safeInternalPath.js";
import { usePageTitle } from "../../../shared/lib/usePageTitle.js";
import { useAuth } from "../useAuth.js";
import { loginSchema } from "../api/authSchema.js";

const serverFieldNames = {
  email: "email",
  senha: "senha",
};

function mapServerField(field) {
  return serverFieldNames[field] || null;
}

export default function LoginPage() {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const alertRef = useRef(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertFocusCount, setAlertFocusCount] = useState(0);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const {
    register,
    handleSubmit,
    reset,
    resetField,
    setError,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: { email: "", senha: "" },
    shouldFocusError: true,
  });

  usePageTitle("Entrar");

  useEffect(() => {
    if (location.state?.message) {
      alertRef.current?.focus();
    }
  }, [location.state?.message]);

  useEffect(() => {
    if (alertFocusCount > 0) {
      alertRef.current?.focus();
    }
  }, [alertFocusCount]);

  const isLocked = lockoutSeconds > 0;

  useEffect(() => {
    if (!isLocked) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setLockoutSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, [isLocked]);

  const remainingSeconds = lockoutSeconds;
  const lockoutMessage =
    remainingSeconds > 0
      ? `Muitas tentativas. Tente novamente em ${Math.ceil(remainingSeconds / 60)} ${
          Math.ceil(remainingSeconds / 60) === 1 ? "minuto" : "minutos"
        }.`
      : "";
  const visibleAlert =
    alertMessage || lockoutMessage || location.state?.message || "";

  function showAlert(message, shouldFocus = true) {
    setAlertMessage(message);
    if (shouldFocus) {
      setAlertFocusCount((count) => count + 1);
    }
  }

  async function submit(credentials) {
    setAlertMessage("");

    try {
      await login(credentials);
      reset();
      navigate(safeInternalPath(location.state?.from), { replace: true });
    } catch (error) {
      if (!(error instanceof ApiError)) {
        showAlert(
          "Não foi possível entrar agora. Verifique sua conexão e tente novamente.",
        );
        return;
      }

      if (error.code === "VALIDATION_ERROR") {
        let firstInvalidField = null;
        error.errors.forEach(({ field, message }) => {
          const fieldName = mapServerField(field);
          if (fieldName) {
            setError(fieldName, {
              type: "server",
              message: message || "Confira este campo.",
            });
            firstInvalidField ||= fieldName;
          }
        });

        if (firstInvalidField) {
          setFocus(firstInvalidField);
        } else {
          showAlert("Confira os dados informados e tente novamente.");
        }
        return;
      }

      if (error.code === "INVALID_CREDENTIALS") {
        showAlert("E-mail ou senha inválidos.", false);
        resetField("senha");
        setFocus("senha");
        return;
      }

      if (error.code === "ACCOUNT_TEMPORARILY_LOCKED") {
        const seconds = error.retryAfter ?? 60;
        setLockoutSeconds(seconds);
        setAlertFocusCount((count) => count + 1);
        return;
      }

      showAlert(
        "Não foi possível entrar agora. Verifique sua conexão e tente novamente.",
      );
    }
  }

  return (
    <main className="app-page d-flex align-items-center justify-content-center p-3">
      <Container className="app-container">
        <Card className="app-card login-card shadow-sm mx-auto">
          <Card.Body className="p-4 p-md-5">
            <h1 className="text-center mb-3">Entrar</h1>
            <img className="login-brand" src={brandLogo} alt="MeuNegocio360" />

            {visibleAlert && (
              <Alert
                ref={alertRef}
                tabIndex={-1}
                variant="danger"
                role="alert"
                className="mb-4"
              >
                {visibleAlert}
              </Alert>
            )}

            <Form noValidate onSubmit={handleSubmit(submit)}>
              <Form.Group className="mb-3" controlId="login-email">
                <Form.Label>E-mail</Form.Label>
                <Form.Control
                  type="email"
                  autoComplete="username"
                  inputMode="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  isInvalid={Boolean(errors.email)}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={
                    errors.email ? "login-email-error" : undefined
                  }
                  {...register("email")}
                />
                <Form.Control.Feedback
                  id="login-email-error"
                  role="alert"
                  type="invalid"
                >
                  {errors.email?.message}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-4" controlId="login-password">
                <Form.Label>Senha</Form.Label>
                <Form.Control
                  type="password"
                  autoComplete="current-password"
                  isInvalid={Boolean(errors.senha)}
                  aria-invalid={Boolean(errors.senha)}
                  aria-describedby={
                    errors.senha ? "login-password-error" : undefined
                  }
                  {...register("senha")}
                />
                <Form.Control.Feedback
                  id="login-password-error"
                  role="alert"
                  type="invalid"
                >
                  {errors.senha?.message}
                </Form.Control.Feedback>
              </Form.Group>

              <Button
                className="w-100"
                type="submit"
                disabled={isSubmitting || remainingSeconds > 0}
                aria-describedby={lockoutMessage ? "login-lockout" : undefined}
              >
                {isSubmitting ? (
                  <>
                    <Spinner
                      animation="border"
                      size="sm"
                      className="me-2"
                      aria-hidden="true"
                    />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
              {lockoutMessage && (
                <span id="login-lockout" className="visually-hidden">
                  {lockoutMessage}
                </span>
              )}
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </main>
  );
}
