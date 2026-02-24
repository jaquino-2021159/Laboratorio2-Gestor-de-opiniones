INSTRUCCIONES GENERALES

1er paso - Crear una carpeta en el disco local C: (Se recomienda nombrarla OpinionesNET).

2do paso - Abrir la terminal y ubicarse dentro de la carpeta creada anteriormente.

3er paso - Clonar el repositorio dentro de la carpeta utilizando el siguiente comando:

git clone https://github.com/jaquino-2021159/Laboratorio2-Gestor-de-opiniones.git

4to paso - Ingresar a la carpeta del proyecto clonado utilizando el comando:

cd Laboratorio2-Gestor-de-opiniones

5to paso - Ejecutar el comando "code ." en la terminal para abrir el proyecto en Visual Studio Code.

6to paso - Dentro de Visual Studio Code abrir dos terminales distintas.

Terminal 1 - Se utilizará para ejecutar el sistema de autenticación.
Terminal 2 - Se utilizará para ejecutar el sistema del gestor de opiniones.

7mo paso - Para probar los endpoints se recomienda utilizar Postman e importar las peticiones usando la opción Import. El archivo a importar se llama "Gestion_Opiniones.postman_collection.json" y se encuentra dentro de la carpeta postman del proyecto.

INSTRUCCIONES AUTENTICACIÓN DE USUARIO

1er paso - Ubicarse dentro de la terminal 1 y entrar a la carpeta del proyecto (si aún no se encuentra dentro).

2do paso - Instalar las dependencias necesarias ejecutando el siguiente comando:

pnpm install

ANTES DE CONTINUAR, IMPORTANTE: Debe tener abierto Docker Desktop para que los contenedores puedan ejecutarse correctamente.

3er paso - Ejecutar el siguiente comando para iniciar los contenedores necesarios del proyecto:

docker compose up -d

4to paso - Verificar en Docker Desktop que los contenedores se hayan iniciado correctamente.

5to paso - Ejecutar el siguiente comando para iniciar el servidor en modo desarrollo:

pnpm run dev

6to paso - Una vez iniciado el servidor, abrir Postman e importar la colección llamada "Gestion_Opiniones.postman_collection.json".

FORMA DE PROBAR LAS PETICIONES (AUTENTICACIÓN)

Probar la carpeta llamada Autenticación.

1.1 Registrar usuario
En la petición de registro debe ingresar sus propios datos como nombre, correo y contraseña.

1.2 Verificar cuenta
Después del registro se enviará un correo con un enlace de verificación. Debe copiar el token que aparece después de "verify/" en la URL y utilizarlo en la petición de verificación.

1.3 Iniciar sesión
Realizar la petición de login y copiar el token que devuelve el sistema.

1.4 Recuperar contraseña
Para recuperar la contraseña se debe enviar el correo en la petición correspondiente. Luego se recibirá un token de recuperación que se utilizará en la petición para establecer la nueva contraseña.

INSTRUCCIONES GESTOR DE OPINIONES

1er paso - En la terminal 2 ubicarse dentro de la carpeta principal del proyecto si aún no se encuentra dentro.

2do paso - Ejecutar nuevamente el proyecto con el comando:

pnpm run dev

ANTES DE CONTINUAR, IMPORTANTE: Debe tener activo MongoDB para verificar que la conexión a la base de datos funcione correctamente.

3er paso - Verificar en MongoDB que exista la base de datos correspondiente al sistema de opiniones y que se estén registrando los datos.

4to paso - Probar las peticiones desde Postman utilizando la colección importada.

FORMA DE PROBAR LAS PETICIONES (PUBLICACIONES)

Probar la carpeta llamada Posts.

1.1 Crear publicación
Para crear una publicación debe ir a la sección Authorization en Postman, seleccionar la opción Bearer Token e ingresar el token obtenido al iniciar sesión.

1.2 Editar publicación
Para editar una publicación debe modificar el id que aparece en la URL después de "/posts/" y colocar el id de la publicación que desea modificar. También debe utilizar Bearer Token con el token obtenido en el login.

1.3 Eliminar publicación
Para eliminar una publicación debe colocar en la URL el id correspondiente de la publicación después de "/posts/" y utilizar Bearer Token con su token de usuario o administrador.

FORMA DE PROBAR LAS PETICIONES (COMENTARIOS)

Probar la carpeta llamada Comentarios.

1.1 Agregar comentario
Debe ingresar el id de la publicación en la URL y escribir el contenido del comentario. También debe usar Bearer Token con el token obtenido al iniciar sesión.

1.2 Editar comentario
Para editar un comentario debe colocar el id del comentario en la URL y modificar su contenido. Debe usar Bearer Token.

1.3 Eliminar comentario
Para eliminar un comentario debe colocar el id del comentario en la URL y usar Bearer Token con el token obtenido al iniciar sesión.
