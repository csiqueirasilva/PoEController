#define MyAppName "PoEController"
#define MyAppVersion "1.0.0-Beta"
#define MyAppPublisher "Caio Siqueira da Silva"
#define MyAppURL "http://github.com/csiqueirasilva/PoEController"
#define LaunchProgram "Launch program"
#define DesktopIcon "Desktop icon"
#define CreateDesktopIcon "Create desktop icon"

[Setup]
AppId={{020D3F3F-186D-4ED1-959D-FED34B08361B}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={pf}\{#MyAppName}
DefaultGroupName={#MyAppName}
Compression=lzma
SolidCompression=yes
OutputDir=bin\
OutputBaseFilename={#MyAppName}-{#MyAppVersion}
UninstallDisplayIcon={app}\src\imgs\app-icon.ico
UninstallDisplayName={#MyAppName}

[Files]
Source: "*"; Excludes: "node_modules\nw\node_modules\*,build\config.gypi,bin\*,.git,.npm"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs; Permissions: everyone-full

[Tasks]
Name: "desktopicon"; Description: "{#CreateDesktopIcon}"; GroupDescription: "{#DesktopIcon}"

[Icons]
Name: "{group}\PoEController"; Filename: "{app}\node_modules\nw\nwjs\nw.exe"; Parameters: ". --disable-gpu --force-cpu-draw"; WorkingDir: "{app}"; IconFilename: "{app}/src/imgs/app-icon.ico"
Name: "{userstartup}\PoEController"; Filename: "{app}\node_modules\nw\nwjs\nw.exe"; Parameters: ". --disable-gpu --force-cpu-draw"; WorkingDir: "{app}"; IconFilename: "{app}/src/imgs/app-icon.ico"
Name: "{userdesktop}\PoEController"; Filename: "{app}\node_modules\nw\nwjs\nw.exe"; Parameters: ". --disable-gpu --force-cpu-draw"; WorkingDir: "{app}"; IconFilename: "{app}/src/imgs/app-icon.ico"; Tasks: desktopicon
Name: "{group}\PoEController Unninstall"; Filename: "{uninstallexe}"

[Run]
Filename: "{app}\node_modules\nw\nwjs\nw.exe"; Parameters: ". --disable-gpu --force-cpu-draw"; WorkingDir: "{app}"; Description: {#LaunchProgram}; Flags: postinstall shellexec