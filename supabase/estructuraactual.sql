CREATE TABLE public.clientes (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  nombre text NOT NULL,
  direccion text NULL,
  telefono text NULL,
  email text NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT clientes_pkey PRIMARY KEY (id)
);

CREATE TABLE public.clientes_reparto (
  id serial NOT NULL,
  cliente_id uuid NOT NULL,
  nombre_reparto character varying(255) NOT NULL,
  direccion_reparto text NULL,
  rango_horario character varying(255) NULL,
  tarifa numeric(10,2) NULL,
  created_at timestamp with time zone NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone NULL,
  telefono_reparto character varying(20) NULL,
  CONSTRAINT clientes_reparto_pkey PRIMARY KEY (id),
  CONSTRAINT clientes_reparto_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_clientes_reparto_cliente_id ON public.clientes_reparto USING btree (cliente_id);

CREATE TABLE public.detalles_reparto (
  id serial NOT NULL,
  reparto_id integer NOT NULL,
  cliente_reparto_id integer NOT NULL,
  valor_entrega numeric(10,2) NULL,
  detalle_entrega text NULL,
  orden_visita integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT detalles_reparto_pkey PRIMARY KEY (id),
  CONSTRAINT detalles_reparto_cliente_reparto_id_fkey FOREIGN KEY (cliente_reparto_id) REFERENCES clientes_reparto(id) ON DELETE CASCADE,
  CONSTRAINT detalles_reparto_reparto_id_fkey FOREIGN KEY (reparto_id) REFERENCES repartos(id) ON DELETE CASCADE
);

CREATE TABLE public.repartidores (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  nombre text NOT NULL,
  identificacion text NULL,
  telefono text NULL,
  vehiculo text NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT repartidores_pkey PRIMARY KEY (id),
  CONSTRAINT repartidores_identificacion_key UNIQUE (identificacion)
);

CREATE TABLE public.repartos (
  id serial NOT NULL,
  fecha_reparto date NOT NULL,
  repartidor_id uuid NOT NULL,
  cliente_id uuid NULL,
  observaciones text NULL,
  created_at timestamp with time zone NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone NULL DEFAULT now(),
  estado character varying(20) NULL DEFAULT 'Asignado'::character varying,
  zona_id integer NULL,
  tanda integer NULL,
  CONSTRAINT repartos_pkey PRIMARY KEY (id),
  CONSTRAINT fk_repartos_zona FOREIGN KEY (zona_id) REFERENCES zonas(id) ON DELETE SET NULL,
  CONSTRAINT repartos_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
  CONSTRAINT repartos_repartidor_id_fkey FOREIGN KEY (repartidor_id) REFERENCES repartidores(id) ON DELETE SET NULL
);

CREATE TABLE public.usuarios (
  codigo serial NOT NULL,
  nombre character varying(255) NOT NULL,
  pass text NOT NULL,
  rol character varying(50) NOT NULL,
  created_at timestamp with time zone NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone NULL DEFAULT now(),
  repartidor_id uuid NULL,
  CONSTRAINT usuarios_pkey PRIMARY KEY (codigo),
  CONSTRAINT usuarios_nombre_key UNIQUE (nombre),
  CONSTRAINT fk_usuarios_repartidor FOREIGN KEY (repartidor_id) REFERENCES repartidores(id) ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE public.zonas (
  id serial NOT NULL,
  nombre text NOT NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT zonas_pkey PRIMARY KEY (id)
);