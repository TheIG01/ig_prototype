# Карта проекта ig_prototype

Что где лежит: файл, строка, экспорт или компонент. Используй grep по имени, потом view ±40 строк. Не открывай большие файлы целиком.

### `src/App.tsx` — 8 строк
- `App` — стр. 6

### `src/features/blocks/DelBlock.tsx` — 36 строк
- `DevIcon` — стр. 8
- `runDel` — стр. 11
- `requestDelBlock` — стр. 16
- `DelDialog` — стр. 21
- `DelIcon` — стр. 36

### `src/features/blocks/blocks.tsx` — 80 строк
- `Thumb` — стр. 11
- `w` — стр. 12
- `SZ` — стр. 14
- `DV` — стр. 15
- `ld` — стр. 16
- `sv` — стр. 17
- `cache` — стр. 18
- `built` — стр. 19
- `SO` — стр. 20
- `BlockPicker` — стр. 21
- `f` — стр. 22
- `setW` — стр. 27
- `tgl` — стр. 28
- `importTpls` — стр. 29
- `hidePv` — стр. 34
- `pw` — стр. 35
- `showPv` — стр. 36
- `pushR` — стр. 37
- `pickB` — стр. 38
- `dlTpls` — стр. 39
- `ulTpls` — стр. 40
- `saveEd` — стр. 41
- `tww` — стр. 42
- `cat` — стр. 43
- `ord` — стр. 44
- `kb` — стр. 45
- `hit` — стр. 46
- `tg` — стр. 47
- `myCats` — стр. 48
- `lib` — стр. 49
- `mine` — стр. 50
- `favB` — стр. 51
- `favItems` — стр. 52
- `star` — стр. 53
- `recItems` — стр. 54
- `cardU` — стр. 55
- `cardB` — стр. 56
- `nav` — стр. 57
- `showFav` — стр. 58
- `ContentPanel` — стр. 74
- `s` — стр. 75
- `b` — стр. 76
### `src/features/canvas/Canvas.tsx` — 283 строк
- `TOOLS` — стр. 13
- `NAME` — стр. 14
- `STY` — стр. 15
- `KEYS` — стр. 16
- `HK` — стр. 17
- `LI` — стр. 19
- `Canvas` — стр. 26
- `H` — стр. 39
- `L` — стр. 148
- `StepsSec` — стр. 218
- `StageSec` — стр. 224
- `TeamSec` — стр. 229
- `BlockLook` — стр. 233
- `AL` — стр. 236
- `BlockPanel` — стр. 243
- `RightPanel` — стр. 274

### `src/features/canvas/ElPanel.tsx` — 96 строк
- `NM` — стр. 10
- `HEX` — стр. 11
- `SHUT` — стр. 14
- `Sec` — стр. 15
- `Color` — стр. 20
- `Range` — стр. 27
- `TextBox` — стр. 31
- `ElPanel` — стр. 34
- `HUGS` — стр. 39
- `StylePanel` — стр. 89

### `src/features/canvas/InlineEdit.tsx` — 16 строк
- `INLINE` — стр. 3
- `InlineEdit` — стр. 6

### `src/features/canvas/Insert.tsx` — 33 строк
- `ElLib` — стр. 6
- `Pick` — стр. 8
- `TABS` — стр. 9
- `SIZE` — стр. 11
- `sz` — стр. 13
- `mk` — стр. 14
- `Prev` — стр. 15
- `LibProps` — стр. 18
- `InsertPanel` — стр. 19
- `icons` — стр. 22
- `pickShape` — стр. 23
### `src/features/canvas/LayPanel.tsx` — 22 строк
- `LayPanel` — стр. 5
- `AL` — стр. 14

### `src/features/canvas/LayerBtns.tsx` — 12 строк
- `LayerBtns` — стр. 6

### `src/features/canvas/MultiPanel.tsx` — 39 строк
- `NM` — стр. 6
- `AL` — стр. 8
- `Rng` — стр. 10
- `TX` — стр. 13
- `MultiPanel` — стр. 15

### `src/features/canvas/Rulers.tsx` — 20 строк
- `STEPS` — стр. 4
- `Ruler` — стр. 6
- `ITEMS` — стр. 15
- `ViewMenu` — стр. 17

### `src/features/canvas/VList.tsx` — 12 строк
- `U` — стр. 5
- `VList` — стр. 6

### `src/features/canvas/elStyle.tsx` — 19 строк
- `SC` — стр. 12
- `elStyle` — стр. 13
- `elInner` — стр. 18
- `ElInner` — стр. 19

### `src/features/canvas/layers.css` — 19 строк

### `src/features/pin/Pin.tsx` — 21 строк
- `Pin` — стр. 6

### `src/features/preview/Preview.tsx` — 6 строк
- `Preview` — стр. 3

### `src/features/quiz/QuizEditor.tsx` — 105 строк
- `TABS` — стр. 11
- `Txt` — стр. 13
- `Num` — стр. 14
- `Tg` — стр. 15
- `Seg` — стр. 16
- `Strs` — стр. 17
- `QuizEditor` — стр. 22

### `src/features/shell/ErrorGate.tsx` — 21 строк
- `ErrorGate` — стр. 8

### `src/lib/migrateEl.ts` — новый: `fixEl` чистит новые поля `El` (nm, rot, flipX/Y, rc, dash, sp, shadow, blur, lockRatio)
### `src/lib/layerUi.ts` — новый: `useLayerUi` (какой слой сейчас переименовывается, Ctrl+R)
### `src/lib/layerKeys.ts` — новый: `matchingIds` (Ctrl+Alt+A), `invertIds` (Ctrl+Shift+A), `wholeGroup`
### `src/features/shell/LayersTab.tsx` — 33 строк
- `IC` — стр. 8
- `NM` — стр. 9
- `dnd` — стр. 20 (перетаскивание слоя: выше, ниже, в папку)
- `LayersTab` — стр. 11

### `src/features/shell/ReportDialog.tsx` — 34 строк
- `VK` — стр. 7
- `ReportDialog` — стр. 9

### `src/features/shell/SaveBar.tsx` — 20 строк
- `downloadCopy` — стр. 8
- `SaveBar` — стр. 15

### `src/features/shell/Settings.tsx` — 60 строк
- `SettingsBody` — стр. 5

### `src/features/shell/Shell.tsx` — 156 строк
- `ReportDialog` — стр. 9
- `SettingsBody` — стр. 10
- `FORMS` — стр. 18
- `TITLE` — стр. 19
- `DEVS` — стр. 20
- `HELP` — стр. 21
- `Ask` — стр. 27
- `Shell` — стр. 29

### `src/lib/art.ts` — 83 строк
- `Role` — стр. 6
- `PStyle` — стр. 7
- `ROLES` — стр. 8
- `FONTS` — стр. 9
- `defStyle` — стр. 10
- `SHAPES` — стр. 14
- `MOCKS` — стр. 15
- `BULLETS` — стр. 16
- `NAME_NEW` — стр. 17
- `ART` — стр. 19
- `P` — стр. 29
- `CHECK` — стр. 55
- `artHtml` — стр. 60
- `resolve` — стр. 68
- `styleMap` — стр. 71
- `styleCss` — стр. 83

### `src/lib/crypto.ts` — 6 строк
- `b64` — стр. 2
- `unb64` — стр. 3
- `keyFrom` — стр. 4
- `seal` — стр. 5
- `unseal` — стр. 6

### `src/lib/dev.ts` — 7 строк
- `Dev` — стр. 1
- `FW` — стр. 2
- `DEVS` — стр. 3
- `onDev` — стр. 5
- `DEVN` — стр. 6
- `DEVS_SHORT` — стр. 7

### `src/lib/export.ts` — 79 строк
- `download` — стр. 3
- `EN` — стр. 4
- `ICN` — стр. 6
- `RULES` — стр. 7
- `briefMd` — стр. 54
- `specJson` — стр. 57
- `blockMd` — стр. 64
- `blockFile` — стр. 66
- `tplsFile` — стр. 67
- `TplIn` — стр. 68
- `parseTpls` — стр. 71

### `src/lib/icons.ts` — 3 строк
- `ICONS` — стр. 2
- `ICON_LIST` — стр. 3

### `src/lib/live.ts` — 11 строк
- `useLive` — стр. 3

### `src/lib/measure.ts` — 20 строк
- `hugSize` — стр. 10
- `textLines` — стр. 20

### `src/lib/migrate.ts` — 27 строк
- `noEls` — стр. 4
- `mkBlock` — стр. 5
- `mkFromTpl` — стр. 6
- `migrate` — стр. 8
- `DV` — стр. 23

### `src/lib/outline.ts` — 25 строк
- `parseOutline` — стр. 7
- `sheetsFromOutline` — стр. 22

### `src/lib/quiz.ts` — 236 строк
- `QOpt` — стр. 7
- `QStep` — стр. 8
- `QuizCfg` — стр. 9
- `QState` — стр. 23
- `QOut` — стр. 24
- `UNKNOWN` — стр. 26
- `BONUS_TXT` — стр. 27
- `BONUS_NAME` — стр. 28
- `TOKENS` — стр. 29
- `baseCfg` — стр. 32
- `normalizeQuiz` — стр. 45
- `Chk` — стр. 64
- `quizCheck` — стр. 66
- `quizFrame` — стр. 84
- `D` — стр. 85
- `X0` — стр. 95
- `IX` — стр. 96
- `R` — стр. 98
- `GR` — стр. 99
- `E` — стр. 103
- `H` — стр. 222
- `applyQuiz` — стр. 233

### `src/lib/report.ts` — 135 строк
- `PageSize` — стр. 7
- `ReportOpts` — стр. 8
- `SIZES` — стр. 9
- `wrapLines` — стр. 13
- `TN` — стр. 16
- `RN` — стр. 17
- `TBL_COLS` — стр. 32
- `buildReport` — стр. 35
- `S` — стр. 36

### `src/lib/select.ts` — 13 строк
- `Mods` — стр. 3
- `modsOf` — стр. 4
- `curSel` — стр. 6
- `pickIds` — стр. 7

### `src/lib/share.ts` — 135 строк
- `P` — стр. 14
- `FW` — стр. 17
- `BASE_CSS` — стр. 89
- `buildHtml` — стр. 127
- `printHtml` — стр. 133

### `src/lib/tabs.ts` — 40 строк
- `TabMode` — стр. 3
- `useTab` — стр. 4
- `isOwner` — стр. 5
- `bindTabs` — стр. 9
- `NAME` — стр. 10
- `claim` — стр. 21
- `takeOver` — стр. 28

### `src/lib/textcheck.ts` — 14 строк
- `NEG` — стр. 2
- `checkText` — стр. 4
- `checkBlock` — стр. 14

### `src/lib/toast.ts` — 6 строк
- `Toast` — стр. 2
- `useToast` — стр. 4
- `toast` — стр. 5
- `dismiss` — стр. 6

### `src/lib/tpl.ts` — 152 строк
- `Node` — стр. 16
- `Built` — стр. 28
- `Tpl` — стр. 29
- `PAD` — стр. 30
- `PV` — стр. 31
- `DI` — стр. 32
- `FS` — стр. 33
- `H2` — стр. 72
- `CTA` — стр. 75
- `SCR` — стр. 78
- `TPLS` — стр. 80
- `CATS` — стр. 136
- `TIPS` — стр. 137
- `buildTpl` — стр. 148
- `buildByName` — стр. 150
- `emptyBuild` — стр. 151
- `fresh` — стр. 152

### `src/lib/tplFirst.ts` — 151 строк
- `Out` — стр. 8
- `r4` — стр. 10
- `th` — стр. 11
- `ctx` — стр. 12
- `C` — стр. 18
- `Part` — стр. 20
- `SCR` — стр. 30
- `H1` — стр. 65
- `SUB` — стр. 66
- `BUL` — стр. 67
- `BULM` — стр. 68
- `LEAD` — стр. 69
- `LEADM` — стр. 70
- `CTAT` — стр. 71
- `NOTE` — стр. 72
- `BEN` — стр. 73
- `PHOTO` — стр. 77
- `LX` — стр. 78
- `FT` — стр. 96
- `LB` — стр. 128
- `FIRST` — стр. 141
- `RULES` — стр. 146
- `FIRST_TIPS` — стр. 147

### `src/lib/tplGuar.ts` — 172 строк
- `SCR` — стр. 9
- `CAP` — стр. 10
- `LX` — стр. 11
- `NUM` — стр. 59
- `LST` — стр. 86
- `BIG` — стр. 110
- `SIX` — стр. 133
- `GUAR` — стр. 166
- `GR` — стр. 171
- `GUAR_TIPS` — стр. 172

### `src/lib/tplLead.ts` — 260 строк
- `DH` — стр. 25
- `SCR` — стр. 26
- `CONSENT` — стр. 27
- `MSG` — стр. 139
- `M3` — стр. 140
- `LR` — стр. 141
- `SPECS` — стр. 143
- `LEAD` — стр. 259
- `LEAD_TIPS` — стр. 260

### `src/lib/tplManager.ts` — 252 строк
- `SCR` — стр. 11
- `CAP` — стр. 12
- `LX` — стр. 13
- `T` — стр. 20
- `NM` — стр. 23
- `H` — стр. 24
- `HM` — стр. 25
- `SUB` — стр. 26
- `SUBM` — стр. 27
- `Q` — стр. 28
- `QM` — стр. 29
- `NOTE` — стр. 30
- `CTA1` — стр. 31
- `B` — стр. 34
- `CH` — стр. 111
- `CHM` — стр. 112
- `GIFT` — стр. 113
- `CTA2` — стр. 114
- `A3` — стр. 147
- `MSG` — стр. 151
- `H3` — стр. 157
- `H3M` — стр. 158
- `S3` — стр. 159
- `S3M` — стр. 160
- `CTA3` — стр. 161
- `H4` — стр. 197
- `H4M` — стр. 198
- `S4` — стр. 199
- `S4M` — стр. 200
- `P4` — стр. 201
- `ST` — стр. 202
- `D4` — стр. 206
- `VARS` — стр. 242
- `MK` — стр. 247
- `GEN` — стр. 248
- `MGR` — стр. 250
- `MGR_TIPS` — стр. 251
- `MGR_NAMES` — стр. 252

### `src/lib/tplQuiz.ts` — 24 строк
- `O` — стр. 7
- `U` — стр. 8
- `SEPTIC_STEPS` — стр. 9
- `QUIZ_CFG` — стр. 15
- `QUIZ` — стр. 22
- `QUIZ_TIPS` — стр. 23

### `src/lib/tplReviews.ts` — 142 строк
- `XX` — стр. 10
- `CTAT` — стр. 11
- `NOTE` — стр. 12
- `W` — стр. 23
- `REV` — стр. 35
- `H1` — стр. 49
- `S1` — стр. 50
- `VID` — стр. 58
- `FILT` — стр. 65
- `H2V` — стр. 68
- `S2V` — стр. 69
- `ORG` — стр. 78
- `H3` — стр. 80
- `S3` — стр. 81
- `H4` — стр. 88
- `S4` — стр. 89
- `SUM` — стр. 90
- `Q4` — стр. 91
- `WHO` — стр. 92
- `PL` — стр. 106
- `PR` — стр. 107
- `H5` — стр. 114
- `S5` — стр. 115
- `REV0` — стр. 127
- `REVIEWS` — стр. 134
- `RR` — стр. 135
- `RT0` — стр. 136
- `REVIEWS_TIPS` — стр. 142

### `src/lib/tplSocial.ts` — 313 строк
- `CAT` — стр. 15
- `SC` — стр. 16
- `BL` — стр. 17
- `XX` — стр. 18
- `NOTE` — стр. 20
- `CTAH` — стр. 21
- `ON` — стр. 29
- `W` — стр. 49
- `SocTab` — стр. 61
- `navH` — стр. 67
- `navV` — стр. 73
- `D1` — стр. 78
- `T1` — стр. 86
- `D2` — стр. 105
- `T2` — стр. 113
- `D4` — стр. 131
- `T4` — стр. 139
- `D5` — стр. 155
- `T5` — стр. 156
- `D6` — стр. 172
- `T6` — стр. 173
- `MK` — стр. 174
- `SOC_TABS` — стр. 187
- `R3` — стр. 195
- `X` — стр. 209
- `D7` — стр. 214
- `P7` — стр. 215
- `X` — стр. 227
- `N8` — стр. 234
- `X` — стр. 245
- `O9` — стр. 252
- `X` — стр. 266
- `L10` — стр. 271
- `F10` — стр. 272
- `X` — стр. 284
- `NM` — стр. 290
- `FL` — стр. 291
- `SOCIAL` — стр. 295
- `TABN` — стр. 299
- `TBT` — стр. 300
- `GEN` — стр. 301
- `TP` — стр. 302
- `SOCIAL_TIPS` — стр. 313

### `src/lib/tplSteps.ts` — 301 строк
- `XX` — стр. 14
- `CT` — стр. 15
- `NOTE` — стр. 16
- `ST` — стр. 20
- `H1` — стр. 29
- `SUB_T` — стр. 30
- `SUB_S` — стр. 31
- `W` — стр. 43
- `D` — стр. 168
- `VARS` — стр. 192
- `OWN` — стр. 204
- `STEPS` — стр. 205
- `stepsBlocks` — стр. 210
- `stageGroup` — стр. 213
- `resizeSteps` — стр. 231
- `SR` — стр. 241
- `TB` — стр. 242
- `STEPS_TIPS` — стр. 243
- `syncTabText` — стр. 256
- `syncTabs` — стр. 260
- `H` — стр. 266
- `dupStage` — стр. 281
- `delStage` — стр. 291
- `bindTplStage` — стр. 298

### `src/lib/tplTeam.ts` — 195 строк
- `TEAM_MIN` — стр. 12
- `SCR` — стр. 13
- `CAP` — стр. 14
- `LX` — стр. 15
- `BLUE` — стр. 16
- `MEM` — стр. 21
- `L` — стр. 32
- `SUB` — стр. 38
- `SUBM` — стр. 39
- `X` — стр. 97
- `GROUP` — стр. 110
- `STAT` — стр. 111
- `STATM` — стр. 112
- `X` — стр. 127
- `CTAT` — стр. 140
- `B3` — стр. 176
- `B4` — стр. 177
- `COMMON` — стр. 179
- `TABT` — стр. 180
- `VARS` — стр. 181
- `TEAM` — стр. 187
- `TEAM_TIPS` — стр. 188
- `teamBuild` — стр. 190
- `TEAM_NAMES` — стр. 191
- `teamN` — стр. 193
- `TEAM_TABS` — стр. 195

### `src/lib/typo.ts` — 54 строк
- `TyKey` — стр. 3
- `Ty` — стр. 4
- `TY_RULES` — стр. 5
- `TY0` — стр. 18
- `TY_DEMO` — стр. 19
- `cleanTy` — стр. 20
- `NB` — стр. 21
- `SHORT` — стр. 22
- `RU_UNITS` — стр. 23
- `EN_UNITS` — стр. 24
- `RU_U` — стр. 26
- `typo` — стр. 35

### `src/lib/ui.ts` — 28 строк
- `Ag` — стр. 4
- `Ui` — стр. 5
- `UI0` — стр. 8
- `ACCENTS` — стр. 9
- `K` — стр. 10
- `getUi` — стр. 18
- `loadUi` — стр. 19
- `useUi` — стр. 20
- `weakDevice` — стр. 22
- `liteOn` — стр. 24
- `applyUi` — стр. 25
- `saveUi` — стр. 28

### `src/lib/uid.ts` — 1 строк
- `uid` — стр. 1

### `src/lib/vault.ts` — 22 строк
- `hasVault` — стр. 3
- `createVault` — стр. 4
- `unlockVault` — стр. 5
- `save` — стр. 6
- `lock` — стр. 7
- `exportCurrent` — стр. 9
- `reread` — стр. 11
- `isQuota` — стр. 13
- `exportBackup` — стр. 14
- `importBackup` — стр. 15
- `rememberDevice` — стр. 19
- `forgetDevice` — стр. 20
- `autoUnlock` — стр. 21
- `wipe` — стр. 22

### `src/main.tsx` — 3 строк

### `src/store.ts` — 194 строк
- `Kind` — стр. 7
- `ET` — стр. 8
- `El` — стр. 9
- `Lay` — стр. 11
- `SV` — стр. 13
- `Block` — стр. 14
- `TplSetItem` — стр. 16
- `BlockTpl` — стр. 18
- `Sheet` — стр. 19
- `Project` — стр. 20
- `SiteType` — стр. 21
- `Data` — стр. 24
- `P` — стр. 25
- `PRESETS` — стр. 27
- `blockTops` — стр. 42
- `EL_DEF` — стр. 53
- `LDV` — стр. 60
- `L` — стр. 80
- `useStore` — стр. 89
- `L` — стр. 162
- `moveLayer`, `toggleFold` — действия внутри `useStore` (стр. 185, рядом с `groupEls`); поле `Block.fo` (открытые папки)

### `src/styles.css` — 666 строк


- 1.49: `Canvas.tsx` — клавиши Ctrl+R, Ctrl+Alt+A, Ctrl+Shift+A, Enter/Shift+Enter (рядом с Ctrl+G, ~стр. 89–125); высота страницы `H` = содержимое + 112. `Shell.tsx` — Alt+1 открывает «Слои», размеры теперь Alt+Shift+1/2/3. `migrate.ts` вызывает `fixEl`.

- 1.50: `src/lib/elFx.ts` (новый) — `fxMap` (CSS для поворота, отражения, радиусов по углам, пунктира, положения обводки, тени, размытия; вызывается из `styleMap` в `art.ts`, поэтому работает в редакторе, просмотре, HTML и PDF), `normRot`.
- 1.50: `src/features/canvas/FxSecs.tsx` (новый) — секции панели `RotSec`, `CornersRow`, `StrokeSec`, `FxSec`, `SelColors`. `ElPanel.tsx`: секции Положение и размер, Поворот и отражение, Вид, Заливка, Обводка, Эффекты, Цвета выделения; `Sec` и `Range` теперь экспортируются.
- 1.50: `Canvas.tsx` — ручка поворота `rot-h` в рамке выделения (`downRot`, режим `rot` в `move`), Shift+H / Shift+V отражает один элемент (`flipX/flipY`). `Shell.tsx` — Alt+8 ставит курсор в панель свойств. `store.ts` — действие `recolor`.

### `src/lib/resizeCalc.ts` — `calcResize` (Shift = пропорции, Alt = от центра)
### `src/lib/quickKeys.ts` — `quickPatch` (Shift+X, Alt+/, Shift+/, цифры = прозрачность)
### `src/features/canvas/ElSettings.tsx` — `ElSettings` (название, видимость на устройстве, статус в ТЗ `ts`)
### `src/features/canvas/BlockPad.tsx` — `BlockPad` (отступы блока `pd`, «Подогнать высоту»)
### `src/lib/rich.ts` — текст с оформлением, списки, ссылки (1.52): `getLines`, `plainOf`, `toPatch`, `richHtml` (HTML для холста, просмотра, PDF), `editHtml`, `parseDom` (редактор → строки), `linkOf`, `linkInfo`, `hrefOf`, `richNotes`/`richJson` (для ТЗ), `RICH_CSS`
### `src/features/canvas/RichEdit.tsx` — `RichEdit`: правка текста на месте с мини-панелью (Ctrl+B/I/U, Ctrl+Shift+X, Ctrl+K), запись в `El.rt`, `El.lt`
### `src/features/canvas/LinkEditor.tsx` — `LinkEditor`: выбор ссылки (страница, блок, адрес, телефон, почта); `El.ln`, старый `El.go` читается как ссылка на лист

### `src/lib/frame.ts` (1.53)
`FRAME` (настройки нового фрейма), `wrapInFrame` (Ctrl+Alt+G). Стрелки `arr1/arr2/elbow/arc` и `lineCss/lineAttr` лежат в `src/lib/art.ts`.

### `src/features/canvas/ElLib.tsx` — 53 строк
- `Mini` — стр. 13
- `handled` — стр. 16
- `Form` — стр. 17
- `ElLib` — стр. 20
- `own` — стр. 21
- `all` — стр. 25
- `ownCats` — стр. 26
- `isOwn` — стр. 27
- `f` — стр. 28
- `list` — стр. 29
- `shown` — стр. 30
- `put` — стр. 31
- `submit` — стр. 32
- `upd` — стр. 36
- `del` — стр. 37
- `up` — стр. 38
- `cats` — стр. 39

### `src/lib/elLib.ts` — 59 строк
- `LibItem` — стр. 6
- `KEY` — стр. 7
- `num` — стр. 8
- `okEl` — стр. 9
- `clone` — стр. 10
- `lh` — стр. 11
- `pack` — стр. 14
- `x0` — стр. 16
- `els` — стр. 17
- `instantiate` — стр. 21
- `gm` — стр. 22
- `tags` — стр. 25
- `parseTags` — стр. 26
- `norm` — стр. 27
- `o` — стр. 28
- `els` — стр. 29
- `load` — стр. 32
- `cache` — стр. 33
- `read` — стр. 34
- `write` — стр. 36
- `useLib` — стр. 37
- `addItem` — стр. 39
- `it` — стр. 40
- `updateItem` — стр. 41
- `editItem` — стр. 42
- `removeItem` — стр. 43
- `restoreItem` — стр. 44
- `libFile` — стр. 46
- `importFile` — стр. 48
- `o` — стр. 49
- `f` — стр. 50
- `add` — стр. 54
- `getRecent` — стр. 57
- `pushRecent` — стр. 58

### `src/lib/elLibBuiltin.ts` — 51 строк
- `BUILTIN_CATS` — стр. 7
- `PH` — стр. 8
- `box` — стр. 9
- `field` — стр. 10
- `Def` — стр. 12
- `DEFS` — стр. 13
- `cache` — стр. 48
- `builtinItems` — стр. 50

_1.54: у `Canvas.tsx`, `store.ts`, `Shell.tsx`, `export.ts` номера строк сдвинулись на несколько строк; новое в них: `putEls`, `editBlockTpl` (store), клавиши Alt+2, Shift+I, Ctrl+Alt+K, Ctrl+Alt+B и `selEls`, `openLib`, `putLib` (Canvas)._

### 1.55 новые файлы
- `src/lib/ff.ts`: `FF`, `FF_KINDS`, `ffPatch`, `ffHtml(e,live)` (поля формы, рисунок и живые поля)
- `src/lib/cmp.ts`: `CP`, `CMP_KINDS`, `cmpPatch`, `cmpHtml` (10 компонентов)
- `src/lib/comments.ts`: `Cm`, `cmNums`, `cmMd`, `cmJson`, `fixCm`, подпись автора
- `src/lib/formDesc.ts`: описание полей, компонентов и формы для ТЗ
- `src/lib/forms.css`: стили полей и компонентов (холст, просмотр, HTML, PDF)
- `src/features/canvas/FormSecs.tsx`: `FieldSec`, `CmpSec`, `FormSec` (панели)
- `src/features/canvas/Comments.tsx`, `cm.css`: `CmLayer` (пины), `CmPanel`, `useCmKeys` (клавиша C)
- Правки: `store.ts` (`El.ff`, `El.cp`, `Block.fm`, `Block.cmt`, `ET cmp`, `cmAdd/cmReply/cmDone/cmDel`), `share.ts` (runtime: маска, проверка, компоненты, пины), `art.ts`, `elStyle.tsx`, `Insert.tsx` (вкладка «Формы»), `export.ts`, `report.ts`, `migrate*.ts`
