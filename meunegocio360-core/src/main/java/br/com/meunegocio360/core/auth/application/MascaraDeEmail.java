package br.com.meunegocio360.core.auth.application;

/** Mascara e-mails para logs de segurança, sem expor o endereço completo (RNF-BE-44, RNF-025). */
final class MascaraDeEmail {

  private MascaraDeEmail() {}

  static String mascarar(String email) {
    if (email == null) {
      return "***";
    }
    int arroba = email.indexOf('@');
    if (arroba <= 0) {
      return "***";
    }
    return email.charAt(0) + "***" + email.substring(arroba);
  }
}
