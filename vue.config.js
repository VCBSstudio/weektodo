module.exports = {
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      customFileProtocol: './',
      builderOptions: {
        appId: "com.helinyu.weekList.mac",
        productName: "WeekList",
        publish: ["github"],
        linux: {
          category: "Utility",
          description: "Free and Open Source Minimalist Weekly Planner and To Do list App focused on privacy.",
          target: ["deb", "pacman","AppImage","rpm"],
          // target: ["deb", "pacman","AppImage"],
          icon: "build/icon.icns",
        },
        win: {
          target: ["nsis"],
        },
       mac: {
          category: "public.app-category.productivity",
          icon: "build/icon.icns",
          // target: [
          //   {
          //     target: "dmg",
          //     arch: ["x64", "arm64", "universal"]
          //   },
          //   {
          //     target: "pkg",
          //     arch: ["x64", "arm64", "universal"]
          //   }
          // ]
          target: [
            {
              target: "dmg",
              arch: ["universal"]
            },
            {
              target: "pkg",
              arch: ["universal"]
            }
          ]
        },
      },
    },
  }
};
