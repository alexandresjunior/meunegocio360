package br.com.meunegocio360.core.empresa.application;

import br.com.meunegocio360.core.empresa.domain.Empresa;
import br.com.meunegocio360.core.empresa.domain.EmpresaRepository;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Ponto único para as demais features obterem a empresa ativa (RNF-096, RNF-BE-05). O {@code
 * empresa_id} é sempre resolvido aqui, no servidor, e NUNCA recebido do cliente.
 *
 * <p>Uso esperado nos cadastros de RF-BE-003 em diante:
 *
 * <ul>
 *   <li>criação de registros: {@link #exigirId()}, que responde 422 {@code COMPANY_NOT_ACTIVE} sem
 *       empresa ativa (RN-04);
 *   <li>consultas: {@link #buscarId()}, pois a leitura dos dados existentes continua permitida.
 * </ul>
 */
@Component
public class EmpresaAtiva {

  private final EmpresaRepository empresas;

  public EmpresaAtiva(EmpresaRepository empresas) {
    this.empresas = empresas;
  }

  /** Id da empresa ativa; lança {@link EmpresaNaoAtivaException} (422) quando não há. */
  @Transactional(readOnly = true)
  public UUID exigirId() {
    return buscarId().orElseThrow(EmpresaNaoAtivaException::new);
  }

  /** Id da empresa ativa, se houver. */
  @Transactional(readOnly = true)
  public Optional<UUID> buscarId() {
    return empresas.findByAtivaTrue().map(Empresa::getId);
  }
}
