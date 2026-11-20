package br.com.meunegocio360.core.empresa.application;

import br.com.meunegocio360.core.empresa.domain.Empresa;
import br.com.meunegocio360.core.empresa.domain.EmpresaRepository;
import br.com.meunegocio360.core.shared.persistence.RestricaoDoBanco;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Component;

/**
 * Grava a empresa e traduz as violações das restrições do banco nos erros de negócio (RNF-BE-15).
 * As verificações prévias dos casos de uso dão a resposta certa no caso comum; as restrições do
 * banco cobrem a condição de corrida entre duas requisições simultâneas.
 */
@Component
class GravadorDeEmpresa {

  private final EmpresaRepository empresas;

  GravadorDeEmpresa(EmpresaRepository empresas) {
    this.empresas = empresas;
  }

  Empresa gravar(Empresa empresa) {
    try {
      return empresas.saveAndFlush(empresa);
    } catch (DataIntegrityViolationException erro) {
      if (RestricaoDoBanco.foiViolada(erro, "uk_empresa_cnpj")) {
        throw new CnpjJaCadastradoException();
      }
      if (RestricaoDoBanco.foiViolada(erro, "uk_empresa_ativa_unica")) {
        throw new EmpresaJaAtivaException();
      }
      throw erro;
    }
  }
}
