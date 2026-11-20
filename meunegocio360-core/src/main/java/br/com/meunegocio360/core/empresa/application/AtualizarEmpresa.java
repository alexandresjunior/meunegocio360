package br.com.meunegocio360.core.empresa.application;

import br.com.meunegocio360.core.empresa.domain.DadosCadastrais;
import br.com.meunegocio360.core.empresa.domain.Empresa;
import br.com.meunegocio360.core.empresa.domain.EmpresaRepository;
import br.com.meunegocio360.core.shared.web.VersaoDesatualizadaException;
import java.time.Clock;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** PUT /empresa/{id}: edita os dados cadastrais com controle otimista (RN-01, RN-06). */
@Service
public class AtualizarEmpresa {

  private final EmpresaRepository empresas;
  private final GravadorDeEmpresa gravador;
  private final Clock clock;

  public AtualizarEmpresa(EmpresaRepository empresas, GravadorDeEmpresa gravador, Clock clock) {
    this.empresas = empresas;
    this.gravador = gravador;
    this.clock = clock;
  }

  @Transactional
  public DadosDaEmpresa executar(UUID id, DadosCadastrais dados, long versao) {
    Empresa empresa = empresas.findById(id).orElseThrow(EmpresaNaoEncontradaException::new);
    if (!empresa.estaNaVersao(versao)) {
      throw new VersaoDesatualizadaException();
    }
    if (empresas.existsByCnpjAndIdNot(dados.cnpj(), id)) {
      throw new CnpjJaCadastradoException();
    }
    empresa.atualizar(dados, clock.instant());
    return DadosDaEmpresa.de(gravador.gravar(empresa));
  }
}
