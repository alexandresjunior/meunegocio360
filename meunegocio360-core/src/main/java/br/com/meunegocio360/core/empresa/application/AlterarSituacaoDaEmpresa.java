package br.com.meunegocio360.core.empresa.application;

import br.com.meunegocio360.core.empresa.domain.Empresa;
import br.com.meunegocio360.core.empresa.domain.EmpresaRepository;
import br.com.meunegocio360.core.shared.web.VersaoDesatualizadaException;
import java.time.Clock;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * PATCH /empresa/{id}/situacao: inativa ou reativa a empresa (RN-02, RN-04). A empresa nunca é
 * excluída. Pedir a situação em que ela já está não altera nada.
 */
@Service
public class AlterarSituacaoDaEmpresa {

  private static final Logger log = LoggerFactory.getLogger(AlterarSituacaoDaEmpresa.class);

  private final EmpresaRepository empresas;
  private final GravadorDeEmpresa gravador;
  private final Clock clock;

  public AlterarSituacaoDaEmpresa(
      EmpresaRepository empresas, GravadorDeEmpresa gravador, Clock clock) {
    this.empresas = empresas;
    this.gravador = gravador;
    this.clock = clock;
  }

  @Transactional
  public DadosDaEmpresa executar(UUID id, boolean ativa, long versao) {
    Empresa empresa = empresas.findById(id).orElseThrow(EmpresaNaoEncontradaException::new);
    if (!empresa.estaNaVersao(versao)) {
      throw new VersaoDesatualizadaException();
    }
    if (empresa.isAtiva() == ativa) {
      return DadosDaEmpresa.de(empresa);
    }
    if (ativa) {
      if (empresas.existsByAtivaTrue()) {
        throw new EmpresaJaAtivaException();
      }
      empresa.reativar(clock.instant());
    } else {
      empresa.inativar(clock.instant());
    }
    Empresa gravada = gravador.gravar(empresa);
    log.info("Situação da empresa alterada empresaId={} ativa={}", id, ativa);
    return DadosDaEmpresa.de(gravada);
  }
}
