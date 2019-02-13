# Transformar um projeto angular num projeto mobile

## Caso geral, cordova
Instalar o Cordova

Ir ao diretório do projeto angular

Compilar o projeto com `ng build --prod`

Criar um projeto cordova: `cordova create [PATH]`

No diretório do projeto cordova remover o diretório www: `rm -rf www`

Fazer um symlink para que o www/ do cordova aponte para o dist/ do angular: `ln -s ../dist www`

Adicionar as plataformas: `cordova platform add [platform]`

Em www/index.html substituir a tag `<base href="/">` por `<base href="./">`

Para compilar `cordova build --release`

Para testar o projeto num dispositivo usar `cordova run [platform]`, para emulá-lo usar `cordova emulate [platform]`

O ícone pode serr configurado no arquivo de configuraçao "config.xml" na tag `<icon src="res/ios/icon.png" platform="ios" width="57" height="57" density="mdpi" />`

### Android
Instalar o Android SDK

Configurar o PATH e as ENVVARs:

`export ANDROID_HOME=$HOME/Android/Sdk`, ou qualquer lugar onde o android sdk estiver instalado

`export PATH=$ANDROID_HOME/tools:$PATH`

`export PATH=$ANDROID_HOME/platform-tools:$PATH`

Aceitar as licenças com:
`$ANDROID_HOME/tools/bin/sdkmanager --licenses`

Criar um Android Virtual Device (AVD), o Android Studio fornece uma ferramenta para facilitar o processo
Outra opção é fazer via linha de comando,

Primeiro deve-se instalar a package:
`$ANDROID_HOME/tools/bin/sdkmanager system-images;[android-version];[api];[arquitetura]`, ex.:
`$ANDROID_HOME/tools/bin/sdkmanager system-images;android-25;google_apis;x86_64`

E criar um AVD com o seguinte comando:
`$ANDROID_HOME/tools/bin/avdmanager create avd --force --name [avd name] --abi [api]/[arquitetura] --package [package previamente instalada]`, ex.:
`$ANDROID_HOME/tools/bin/avdmanager create avd --force --name testAVD --abi google_apis/x86_64 --package 'system-images;android-25;google_apis;x86_64'`


Agora existe um projeto android dentro da pasta do cordova em `platform/android`, lá é possível editar o android manifest


### Windows Phone/Tablet

Segundo o UWP, um tablet está no grupo desktop, diferente dos celulares que estão no grupo mobile

Rodar cordova requirements e atender os requerimentos necessários instalando o visual studio e as MBuildTools específicas

Para compilar para um windows tablet: `cordova build windows`

Para compilar num windows phone usar: `cordova build windows --appx=8.1-phone` ou `cordova build windows --appx=8.0-phone`
