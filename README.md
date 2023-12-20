# ModdedHairAddon

---

`ModdedHairAddon` : `ModdedHairAddon`

```json lines
{
  "additionFile": [
    "feats1.json",
    "feats2.json"
  ],
  "addonPlugin": [
    {
      "modName": "ModdedHairAddon",
      "addonName": "ModdedHairAddon",
      "modVersion": "^1.0.0",
      "params": {
        "feats": [
          // 可以将其拆分为多个文件，在注入游戏时会按顺序合并到一起注入
          // It can be split into multiple files, which will be merged in order when injected into the game
          "hair1.json",
          "hair2.json"
        ]
      }
    }
  ],
  "dependenceInfo": [
    {
      "modName": "ModdedHairAddon",
      "version": "^1.0.0"
    }
  ]
}
```

下面是 `hair1.json` 的例子:  
follow is the example of `hair1.json`:  

```json5
{
  "fringe": [
    {
      name: "natural",
      name_cap: "Natural",
      variable: "default",
      type: [
        "short"
      ],
      shop: [
        "mirrorhair"
      ],
    },
    {
      name: "blunt locks",
      name_cap: "Blunt Locks",
      variable: "blunt sidelocks",
      type: [
        "loose",
        "sleek"
      ],
      shop: [
        "mirrorhair"
      ],
    },
  ],
  "sides": [
    {
      name: "natural",
      name_cap: "Natural",
      variable: "default",
      type: [
        "loose",
        "wavy"
      ],
      shop: [
        "mirrorhair"
      ],
    },
    {
      name: "afro",
      name_cap: "Afro",
      variable: "fro",
      type: [
        "textured",
        "loose"
      ],
      shop: [
        "mirrorhair"
      ],
    },
  ]
}
```
