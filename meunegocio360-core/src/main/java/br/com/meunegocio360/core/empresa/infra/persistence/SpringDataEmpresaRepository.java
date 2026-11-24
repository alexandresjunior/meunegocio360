package br.com.meunegocio360.core.empresa.infra.persistence;

import br.com.meunegocio360.core.empresa.domain.Empresa;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpringDataEmpresaRepository extends JpaRepository<Empresa, UUID> {

  Optional<Empresa> findFirstByAtivaTrue();

  boolean existsByAtivaTrue();

  Page<Empresa> findAllByAtivaFalse(Pageable pageable);

  Optional<Empresa> findByCnpj(String cnpj);
}
