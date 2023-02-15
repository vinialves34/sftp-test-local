const Client = require("ssh2-sftp-client");
const fs = require("fs");

const sftp = new Client();

async function connectionSftp() {
  const connection = sftp.connect({
    host: "127.0.0.1",
    port: "2222",
    username: "test",
    password: "pass"
  })
  .then(() => console.log("SFTP conectado com sucesso!"))
  .catch(() => console.log("Não foi possível conectar ao SFTP."));

  return connection;
}

module.exports.listFiles = async function () {
  await connectionSftp().then(async () => {
    const files = await sftp.list("/upload")
    
    const filesExists = files.length > 0;
    (filesExists)
      ? console.log("Arquivos =>", files)
      : console.log("Não existe arquivos no diretório.")
    ;

    return sftp.end();
  })
  .catch(err => console.log("Oopss não foi possível ler o diretório.", err));
}

module.exports.uploadFile = async function (filename, content) {
  await connectionSftp().then(async () => {
    const fileTmp = `./tmp/${filename}.txt`;
    fs.writeFileSync(fileTmp, content);
    
    const fileTmpExists = fs.existsSync(fileTmp);
    if (fileTmpExists) {
      await sftp.put(
        fs.createReadStream(fileTmp),
        `./upload/${filename}.txt`
      );

      fs.unlinkSync(fileTmp);
    }

    return sftp.end();
  })
  .catch(err => console.log("Oopss não foi possível criar o arquivo.", err));
}

module.exports.deleteFile = async function (filename) {
  await connectionSftp().then(async () => {
    const file = `/upload/${filename}.txt`;
    
    await sftp.delete(file);

    const fileExists = await sftp.exists(file);
    if (!fileExists) {
      console.log("Arquivo excluído com sucesso!");
    }
    
    return sftp.end();
  })
  .catch(err => console.log("Oopss não foi possível excluir o arquivo.", err));
}