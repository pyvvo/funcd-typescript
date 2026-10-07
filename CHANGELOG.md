# Changelog

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
