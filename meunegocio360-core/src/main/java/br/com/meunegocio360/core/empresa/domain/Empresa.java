package br.com.meunegocio360.core.empresa.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Objects;
import java.util.UUID;

/**
 * Empresa da instalação (RF-BE-002). Nunca é excluída, apenas inativada (RN-04). A unicidade de
 * "uma empresa ativa" (RN-02) é garantida pelo banco, pela coluna gerada {@code ativa_unica}, que
 * não é mapeada aqui por ser calculada pelo MySQL.
 */
@Entity
@Table(name = "empresa")
public class Empresa {

  public static final String FUSO_HORARIO_PADRAO = "America/Sao_Paulo";
  public static final String MOEDA_PADRAO = "BRL";

  @Id private UUID id;

  @Column(name = "razao_social", nullable = false, length = 150)
  private String razaoSocial;

  @Column(name = "nome_fantasia", length = 150)
  private String nomeFantasia;

  @Column(nullable = false, length = 14, unique = true)
  private String cnpj;

  @Column(length = 160)
  private String email;

  @Column(length = 11)
  private String telefone;

  @Column(name = "fuso_horario", nullable = false, length = 50)
  private String fusoHorario;

  @Column(nullable = false, length = 3)
  private String moeda;

  @Column(nullable = false)
  private boolean ativa;

  @Column(name = "criado_em", nullable = false, updatable = false)
  private Instant criadoEm;

  @Column(name = "atualizado_em", nullable = false)
  private Instant atualizadoEm;

  /** Wrapper (e não primitivo) para que o Spring Data reconheça a entidade nova pelo valor nulo. */
  @Version
  @Column(nullable = false)
  private Long versao;

  protected Empresa() {}

  /** Nova empresa, já ativa (contrato de POST /empresa). */
  public static Empresa nova(DadosCadastrais dados, Instant agora) {
    Empresa empresa = new Empresa();
    empresa.id = UUID.randomUUID();
    empresa.aplicar(dados);
    empresa.ativa = true;
    empresa.criadoEm = naPrecisaoDoBanco(agora);
    empresa.atualizadoEm = empresa.criadoEm;
    return empresa;
  }

  public void atualizar(DadosCadastrais dados, Instant agora) {
    aplicar(dados);
    atualizadoEm = naPrecisaoDoBanco(agora);
  }

  public void inativar(Instant agora) {
    ativa = false;
    atualizadoEm = naPrecisaoDoBanco(agora);
  }

  public void reativar(Instant agora) {
    ativa = true;
    atualizadoEm = naPrecisaoDoBanco(agora);
  }

  /** RN-06: a versão enviada pelo cliente precisa ser a versão atual. */
  public boolean estaNaVersao(long versaoInformada) {
    return versao != null && versao == versaoInformada;
  }

  /**
   * DATETIME(6) guarda microssegundos: truncar aqui faz a resposta do cadastro mostrar o mesmo
   * instante que as consultas seguintes.
   */
  private static Instant naPrecisaoDoBanco(Instant instante) {
    return instante.truncatedTo(ChronoUnit.MICROS);
  }

  private void aplicar(DadosCadastrais dados) {
    razaoSocial = Objects.requireNonNull(dados.razaoSocial());
    nomeFantasia = dados.nomeFantasia();
    cnpj = Objects.requireNonNull(dados.cnpj());
    email = dados.email();
    telefone = dados.telefone();
    fusoHorario = dados.fusoHorario() == null ? FUSO_HORARIO_PADRAO : dados.fusoHorario();
    moeda = dados.moeda() == null ? MOEDA_PADRAO : dados.moeda();
  }

  public UUID getId() {
    return id;
  }

  public String getRazaoSocial() {
    return razaoSocial;
  }

  public String getNomeFantasia() {
    return nomeFantasia;
  }

  public String getCnpj() {
    return cnpj;
  }

  public String getEmail() {
    return email;
  }

  public String getTelefone() {
    return telefone;
  }

  public String getFusoHorario() {
    return fusoHorario;
  }

  public String getMoeda() {
    return moeda;
  }

  public boolean isAtiva() {
    return ativa;
  }

  public Instant getCriadoEm() {
    return criadoEm;
  }

  public Instant getAtualizadoEm() {
    return atualizadoEm;
  }

  public Long getVersao() {
    return versao;
  }
}
