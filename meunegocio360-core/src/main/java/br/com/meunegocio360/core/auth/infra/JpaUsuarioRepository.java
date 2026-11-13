package br.com.meunegocio360.core.auth.infra;

import br.com.meunegocio360.core.auth.domain.Usuario;
import br.com.meunegocio360.core.auth.domain.UsuarioRepository;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

/** Implementação Spring Data JPA da porta {@link UsuarioRepository}. */
interface JpaUsuarioRepository extends Repository<Usuario, UUID>, UsuarioRepository {

  @Override
  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select u from Usuario u where u.email = :email")
  Optional<Usuario> buscarPorEmailParaAtualizacao(@Param("email") String email);
}
