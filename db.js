const Pool = require("pg").Pool;

const pool = new Pool({
	user: "postgres",
	password: "enkidu",
	host: "localhost",
	port: 5432,
	database: "home_worker_bot",
});

class DBlogic {
	async migrateAll() {
		const resp = await pool.query(`
		CREATE TABLE IF NOT EXISTS public."Courses"
		(
			id integer NOT NULL DEFAULT nextval('"Courses_id_seq"'::regclass),
			name character varying(255) COLLATE pg_catalog."default" NOT NULL,
			"createdAt" timestamp with time zone NOT NULL,
			"updatedAt" timestamp with time zone NOT NULL,
			CONSTRAINT "Courses_pkey" PRIMARY KEY (id)
		)
		
		TABLESPACE pg_default;
		
		ALTER TABLE public."Courses"
			OWNER to postgres;
			
		CREATE TABLE IF NOT EXISTS public."Works"
		(
			id integer NOT NULL DEFAULT nextval('"Works_id_seq"'::regclass),
			description character varying(255) COLLATE pg_catalog."default" NOT NULL,
			"createdAt" timestamp with time zone NOT NULL,
			"updatedAt" timestamp with time zone NOT NULL,
			"CourseId" integer,
			CONSTRAINT "Works_pkey" PRIMARY KEY (id),
			CONSTRAINT "Works_CourseId_fkey" FOREIGN KEY ("CourseId")
				REFERENCES public."Courses" (id) MATCH SIMPLE
				ON UPDATE CASCADE
				ON DELETE SET NULL
		)

		TABLESPACE pg_default;

		ALTER TABLE public."Works"
    	OWNER to postgres;`)
	}


	async getAllCourses() {
		try {
			const resp = await pool.query(`SELECT id, name, "createdAt", "updatedAt"
			FROM public."Courses";`);

			if (resp.rows[0]) {
				return resp.rows;
			}
		} catch (error) {
			return error;
		}
		
	}

	async createCourse(name) {
		try {
			const now = new Date();
			const resp = await pool.query(`INSERT INTO public."Courses"(name, "createdAt", "updatedAt")
			VALUES ($1, $2, $3) RETURNING *;`, [name, now, now]);

			if (resp.rows[0]) {
				return resp.rows;
			}
		} catch (error) {
			console.log(error);
		}
	}

	async getAllWorks() {
		try {
			const resp = await pool.query(`SELECT public."Works".description, public."Courses".name
			FROM public."Works"
			JOIN public."Courses" ON "Courses".id = "Works"."CourseId";`);

			if (resp.rows[0]) {
				return resp.rows;
			}
		} catch (error) {
			return error;
		}
	}

	async createWork(description, id) {
		try {
			const now = new Date();
			const del = await pool.query(`	DELETE FROM public."Works"
			WHERE "CourseId" = $1;`, [id]);
			const resp = await pool.query(`
			INSERT INTO public."Works"(
				description, "createdAt", "updatedAt", "CourseId")
				VALUES ($1, $2, $3, $4) RETURNING*;`, [description, now, now, id]);

			if (resp.rows[0]) {
				return resp.rows;
			}
		} catch (error) {
			return error;
		}
	}

}

module.exports = new DBlogic();
