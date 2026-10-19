# Changelog

## [0.19.1](https://github.com/pyvvo/funcd-typescript/compare/v0.19.0...v0.19.1) (2026-10-19)


### Bug Fixes

* **examples:** env-echo reads its Secret through ctx.secret (funcd ADR-0249) ([#84](https://github.com/pyvvo/funcd-typescript/issues/84)) ([1633541](https://github.com/pyvvo/funcd-typescript/commit/1633541dbbd5110c03ed60e59554b4c69edd7b15))

## [0.19.0](https://github.com/pyvvo/funcd-typescript/compare/v0.18.0...v0.19.0) (2026-10-19)


### ⚠ BREAKING CHANGES

* contract files in place of funcdctl.yaml (funcd ADR-0247) ([#79](https://github.com/pyvvo/funcd-typescript/issues/79))
* **shim:** context.secret reads each secret from funcd's local API (funcd ADR-0249) ([#81](https://github.com/pyvvo/funcd-typescript/issues/81))

### Features

* contract files in place of funcdctl.yaml (funcd ADR-0247) ([#79](https://github.com/pyvvo/funcd-typescript/issues/79)) ([d61c85f](https://github.com/pyvvo/funcd-typescript/commit/d61c85f2f586793385162f1db0d8510067e3df96))
* **shim:** context.secret reads each secret from funcd's local API (funcd ADR-0249) ([#81](https://github.com/pyvvo/funcd-typescript/issues/81)) ([0531b01](https://github.com/pyvvo/funcd-typescript/commit/0531b01c113c36c0d439d40c87bf6ce2abc8369a))

## [0.18.0](https://github.com/pyvvo/funcd-typescript/compare/v0.17.0...v0.18.0) (2026-10-19)


### ⚠ BREAKING CHANGES

* bindings under spec.bindings and stores at the root (funcd ADR-0246, ADR-0248) ([#80](https://github.com/pyvvo/funcd-typescript/issues/80))

### Features

* bindings under spec.bindings and stores at the root (funcd ADR-0246, ADR-0248) ([#80](https://github.com/pyvvo/funcd-typescript/issues/80)) ([ea76b04](https://github.com/pyvvo/funcd-typescript/commit/ea76b04096baa311804b0250fc914d865f907b7a))

## [0.17.0](https://github.com/pyvvo/funcd-typescript/compare/v0.16.0...v0.17.0) (2026-10-19)


### Features

* **shim:** context.config, context.secret and context.catalog (funcd ADR-0245) ([#77](https://github.com/pyvvo/funcd-typescript/issues/77)) ([3204a85](https://github.com/pyvvo/funcd-typescript/commit/3204a8513d60ebd6d1d17cdbda4002bf99746d98))

## [0.16.0](https://github.com/pyvvo/funcd-typescript/compare/v0.15.0...v0.16.0) (2026-10-18)


### Features

* **vite-plugin:** deliver each rebuilt function to outDir under vite build --watch ([#75](https://github.com/pyvvo/funcd-typescript/issues/75)) ([15a959f](https://github.com/pyvvo/funcd-typescript/commit/15a959f379334e821376af39c29aa442d3815dc1))

## [0.15.0](https://github.com/pyvvo/funcd-typescript/compare/v0.14.0...v0.15.0) (2026-10-17)


### Features

* **shim:** Functions that serve HTTP with http(app) and context.fetch (funcd ADR-0243) ([#71](https://github.com/pyvvo/funcd-typescript/issues/71)) ([a8ce265](https://github.com/pyvvo/funcd-typescript/commit/a8ce2651e981ac63376f98f25c08d7baef6c84f2))

## [0.14.0](https://github.com/pyvvo/funcd-typescript/compare/v0.13.0...v0.14.0) (2026-10-17)


### ⚠ BREAKING CHANGES

* **examples:** auth.mode open in place of public in the s3-roundtrip Sites (funcd ADR-0241) ([#69](https://github.com/pyvvo/funcd-typescript/issues/69))

### Features

* **examples:** auth.mode open in place of public in the s3-roundtrip Sites (funcd ADR-0241) ([#69](https://github.com/pyvvo/funcd-typescript/issues/69)) ([2f88c1b](https://github.com/pyvvo/funcd-typescript/commit/2f88c1b3a242608c1a2846e7d1a53e23f65c9188))

## [0.13.0](https://github.com/pyvvo/funcd-typescript/compare/v0.12.0...v0.13.0) (2026-10-12)


### Features

* **examples:** sql-notes and sql-search, SQL databases from TypeScript (funcd FEAT-0011) ([#67](https://github.com/pyvvo/funcd-typescript/issues/67)) ([87e955b](https://github.com/pyvvo/funcd-typescript/commit/87e955b1d30dde701713e235ac42ff8eb1ab6c88))

## [0.12.0](https://github.com/pyvvo/funcd-typescript/compare/v0.11.0...v0.12.0) (2026-10-12)


### Features

* **shim:** context.sql, SQL over the local API (funcd ADR-0233) ([#65](https://github.com/pyvvo/funcd-typescript/issues/65)) ([2d0efca](https://github.com/pyvvo/funcd-typescript/commit/2d0efca4094de3a6fcfbe7e4fcaeb52673c463be))

## [0.11.0](https://github.com/pyvvo/funcd-typescript/compare/v0.10.0...v0.11.0) (2026-10-11)


### Features

* **shim:** the handler reads its deadline and a blocked pool worker is ended (funcd ADR-0226) ([#60](https://github.com/pyvvo/funcd-typescript/issues/60)) ([a756305](https://github.com/pyvvo/funcd-typescript/commit/a7563052c8b165966ac20d2972748c5f3d9b039f))

## [0.10.0](https://github.com/pyvvo/funcd-typescript/compare/v0.9.0...v0.10.0) (2026-10-10)


### Features

* **shim:** readiness checks the function's declared dependencies (funcd ADR-0215) ([#58](https://github.com/pyvvo/funcd-typescript/issues/58)) ([ee59a10](https://github.com/pyvvo/funcd-typescript/commit/ee59a102930f135068ad1c41271c7b817b759d2e))

## [0.9.0](https://github.com/pyvvo/funcd-typescript/compare/v0.8.2...v0.9.0) (2026-10-07)


### ⚠ BREAKING CHANGES

* **shim:** send an empty presign expiry so the server refuses it ([#55](https://github.com/pyvvo/funcd-typescript/issues/55))

### Features

* **shim:** send an empty presign expiry so the server refuses it ([#55](https://github.com/pyvvo/funcd-typescript/issues/55)) ([088b29e](https://github.com/pyvvo/funcd-typescript/commit/088b29e7905aec3b585841a8093f46c6de162b22))

## [0.8.2](https://github.com/pyvvo/funcd-typescript/compare/v0.8.1...v0.8.2) (2026-10-07)


### Bug Fixes

* **examples:** write the timer interval as a duration string ([#53](https://github.com/pyvvo/funcd-typescript/issues/53)) ([e3683e4](https://github.com/pyvvo/funcd-typescript/commit/e3683e48325855b28b68072dcf5980d7672e5d5b))

## [0.8.1](https://github.com/pyvvo/funcd-typescript/compare/v0.8.0...v0.8.1) (2026-10-05)


### Bug Fixes

* **examples:** accept big in the log-burst input contract ([#50](https://github.com/pyvvo/funcd-typescript/issues/50)) ([86d5434](https://github.com/pyvvo/funcd-typescript/commit/86d54342cbbbf1bb18b9d9a40539b292a3da2f99))

## [0.8.0](https://github.com/pyvvo/funcd-typescript/compare/v0.7.0...v0.8.0) (2026-10-05)


### Features

* **shim:** bound each log record and write the listening line to stdout ([#47](https://github.com/pyvvo/funcd-typescript/issues/47)) ([750942a](https://github.com/pyvvo/funcd-typescript/commit/750942a82ee6754256086c79fead038511b8d349))
* **shim:** send traceparent and emit a CLIENT span from context.invoke ([#49](https://github.com/pyvvo/funcd-typescript/issues/49)) ([13125c5](https://github.com/pyvvo/funcd-typescript/commit/13125c5da680f996135927745d10f958cd8a32af))

## [0.7.0](https://github.com/pyvvo/funcd-typescript/compare/v0.6.0...v0.7.0) (2026-10-05)


### Features

* **shim:** load pool members on their own and name the member on every channel ([#45](https://github.com/pyvvo/funcd-typescript/issues/45)) ([4f16ad3](https://github.com/pyvvo/funcd-typescript/commit/4f16ad3508a37f7681c632f52af427e906280462))

## [0.6.0](https://github.com/pyvvo/funcd-typescript/compare/v0.5.0...v0.6.0) (2026-10-05)


### Features

* **examples:** add the fn-to-fn fan-out demo of the nested in-flight cap ([#43](https://github.com/pyvvo/funcd-typescript/issues/43)) ([e1fdae6](https://github.com/pyvvo/funcd-typescript/commit/e1fdae65bfd805c49d977f9b7338ef622fd5c5d6))

## [0.5.0](https://github.com/pyvvo/funcd-typescript/compare/v0.4.4...v0.5.0) (2026-10-05)


### Features

* **shim:** pooled Node calls follow funcd's X-Funcd-Timeout-Ms ([#41](https://github.com/pyvvo/funcd-typescript/issues/41)) ([a77602b](https://github.com/pyvvo/funcd-typescript/commit/a77602bcc035eac8970dd0615ecc08822ebf73a8))


### Bug Fixes

* **shim:** bound the int64 format to the JSON safe-integer range ([#40](https://github.com/pyvvo/funcd-typescript/issues/40)) ([b092436](https://github.com/pyvvo/funcd-typescript/commit/b0924369e2a7a8f4b7c99ef25886f04dbfffc89c))

## [0.4.4](https://github.com/pyvvo/funcd-typescript/compare/v0.4.3...v0.4.4) (2026-10-03)


### Bug Fixes

* **shim:** back off pool worker restarts that fail at boot ([#37](https://github.com/pyvvo/funcd-typescript/issues/37)) ([e499df5](https://github.com/pyvvo/funcd-typescript/commit/e499df534a604154fddc64f874450d90061eb061))

## [0.4.3](https://github.com/pyvvo/funcd-typescript/compare/v0.4.2...v0.4.3) (2026-10-03)


### Bug Fixes

* **shim:** pool restart, call-named errors, log attrs, test temp dirs ([#34](https://github.com/pyvvo/funcd-typescript/issues/34)) ([2ea08d3](https://github.com/pyvvo/funcd-typescript/commit/2ea08d3089a1c09cf2c4f7431cfff471e559e8ee))

## [0.4.2](https://github.com/pyvvo/funcd-typescript/compare/v0.4.1...v0.4.2) (2026-10-03)


### Bug Fixes

* **shim:** harden reply drops, pool faults and log args capture ([#26](https://github.com/pyvvo/funcd-typescript/issues/26)) ([b02d619](https://github.com/pyvvo/funcd-typescript/commit/b02d61906d35424cdbe33be5f68b2bb85ae10cc7))

## [0.4.1](https://github.com/pyvvo/funcd-typescript/compare/v0.4.0...v0.4.1) (2026-10-02)


### Bug Fixes

* **shim:** harden contract checks, logging and invoke handling ([#19](https://github.com/pyvvo/funcd-typescript/issues/19)) ([622be06](https://github.com/pyvvo/funcd-typescript/commit/622be0691a9471acb5f180cae24aa338ca3c9c00))

## [0.4.0](https://github.com/pyvvo/funcd-typescript/compare/v0.3.0...v0.4.0) (2026-10-02)


### Features

* add @funcd-dev/vite-plugin and build the examples with it ([#14](https://github.com/pyvvo/funcd-typescript/issues/14)) ([f2c04dc](https://github.com/pyvvo/funcd-typescript/commit/f2c04dc1a323ae5e4f011384ce13fd8bb13ac221))

## [0.3.0](https://github.com/pyvvo/funcd-typescript/compare/v0.2.0...v0.3.0) (2026-09-27)


### Features

* **shim:** embed and export the pool shim for funcd ([#10](https://github.com/pyvvo/funcd-typescript/issues/10)) ([6a6c68d](https://github.com/pyvvo/funcd-typescript/commit/6a6c68d294c372e3fc7755ff66ea5db8bb632d5f))

## [0.2.0](https://github.com/pyvvo/funcd-typescript/compare/v0.1.0...v0.2.0) (2026-09-27)


### Features

* **shim:** publish @funcd-dev/shim to npm ([#8](https://github.com/pyvvo/funcd-typescript/issues/8)) ([16bc938](https://github.com/pyvvo/funcd-typescript/commit/16bc938849f3e8445f5775966b64489b5d331ebe))
