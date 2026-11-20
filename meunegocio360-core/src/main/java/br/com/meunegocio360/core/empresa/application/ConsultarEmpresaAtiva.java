package br.com.meunegocio360.core.empresa.application;

import br.com.meunegocio360.core.empresa.domain.EmpresaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** GET /empresa: qualquer usuário autenticado consulta a empresa ativa (RN-03). */
@Service
public class ConsultarEmpresaAtiva {

  private final EmpresaRepository empresas;

  public ConsultarEmpresaAtiva(EmpresaRepository empresas) {
    this.empresas = empresas;
  }

  @Transactional(readOnly = true)
  public DadosDaEmpresa executar() {
    return empresas
        .findByAtivaTrue()
        .map(DadosDaEmpresa::de)
        .orElseThrow(EmpresaNaoCadastradaException::new);
  }
}
