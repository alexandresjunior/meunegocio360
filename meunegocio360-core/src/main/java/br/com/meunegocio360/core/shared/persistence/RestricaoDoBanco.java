package br.com.meunegocio360.core.shared.persistence;

import java.util.Locale;
import org.hibernate.exception.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;

/**
 * Identifica qual restrição do banco foi violada, para traduzi-la no erro de negócio correspondente
 * em vez de um erro genérico (RNF-BE-15).
 */
public final class RestricaoDoBanco {

  private RestricaoDoBanco() {}

  public static boolean foiViolada(DataIntegrityViolationException erro, String nomeDaRestricao) {
    String procurado = nomeDaRestricao.toLowerCase(Locale.ROOT);
    for (Throwable causa = erro; causa != null; causa = causa.getCause()) {
      if (causa instanceof ConstraintViolationException violacao
          && violacao.getConstraintName() != null
          && violacao.getConstraintName().toLowerCase(Locale.ROOT).contains(procurado)) {
        return true;
      }
      if (causa.getMessage() != null
          && causa.getMessage().toLowerCase(Locale.ROOT).contains(procurado)) {
        return true;
      }
    }
    return false;
  }
}
