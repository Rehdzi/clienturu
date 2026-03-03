import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function start() {
    const PORT = process.env.PORT || 5050;
    const app = await NestFactory.create(AppModule);

    //  Swagger setup   //
    const config = new DocumentBuilder()
        .setTitle("Clientu.ru")
        .setVersion("1.1")
        .build()
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('/api/docs', app, document);

    //  Server Start    //
    await app.listen(PORT, () => console.log('Server started.'));
}

start()