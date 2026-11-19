package br.com.meunegocio360.core.empresa.application;

import br.com.meunegocio360.core.empresa.domain.DadosCadastrais;
import br.com.meunegocio360.core.empresa.domain.Empresa;
import br.com.meunegocio360.core.empresa.domain.EmpresaRepository;
import java.time.Clock;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** POST /empresa: cadastra a empresa já ativa (RN-01, RN-02, RN-05). */
@Service
public class CadastrarEmpresa {

  private static final Logger log = LoggerFactory.getLogger(CadastrarEmpresa.class);

  private final EmpresaRepository empresas;
  private final GravadorDeEmpresa gravador;
  private final Clock clock;

  public CadastrarEmpresa(EmpresaRepository empresas, GravadorDeEmpresa gravador, Clock clock) {
    this.empresas = empresas;
    this.gravador = gravador;
    this.clock = clock;
  }

  @Transactional
  public DadosDaEmpresa executar(DadosCadastrais dados) {
    // A duplicidade de CNPJ é verificada antes, para que um CNPJ repetido nunca seja reportado
    // como "empresa já ativa".
    if (empresas.existsByCnpj(dados.cnpj())) {
      throw new CnpjJaCadastradoException();
    }
    if (empresas.existsByAtivaTrue()) {
      throw new EmpresaJaAtivaException();
    }
    Empresa empresa = gravador.gravar(Empresa.nova(dados, clock.instant()));
    log.info("Empresa cadastrada empresaId={}", empresa.getId());
    return DadosDaEmpresa.de(empresa);
  }
}
