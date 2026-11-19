package br.com.meunegocio360.core.empresa.infra;

import br.com.meunegocio360.core.empresa.domain.Empresa;
import br.com.meunegocio360.core.empresa.domain.EmpresaRepository;
import java.util.UUID;
import org.springframework.data.repository.Repository;

/** Implementação Spring Data JPA da porta {@link EmpresaRepository}. */
interface JpaEmpresaRepository extends Repository<Empresa, UUID>, EmpresaRepository {}
