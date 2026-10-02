import { createRequire as __funcdCreateRequire } from "node:module";
__funcdCreateRequire(import.meta.url);
import { Readable, Writable } from "node:stream";
import { createHash, createHmac, createPrivateKey, createPublicKey, getRandomValues, sign } from "node:crypto";
import { ReadStream, fstatSync, lstatSync, promises, readFileSync } from "node:fs";
import { homedir, platform, release } from "node:os";
import { dirname, join, sep } from "node:path";
import fs, { readFile } from "node:fs/promises";
import node_http from "node:http";
import * as zlib from "node:zlib";
import { env, versions } from "node:process";
import node_https from "node:https";
import { exec } from "node:child_process";
import { promisify } from "node:util";
//#region \0rolldown/runtime.js
var __defProp = Object.defineProperty;
var __esmMin = (fn, res, err) => () => {
	if (err) throw err[0];
	try {
		return fn && (res = fn(fn = 0)), res;
	} catch (e) {
		throw err = [e], e;
	}
};
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
//#endregion
//#region ../../node_modules/@aws-sdk/checksums/dist-es/submodules/flexible-checksums/constants.js
var RequestChecksumCalculation = {
	WHEN_SUPPORTED: "WHEN_SUPPORTED",
	WHEN_REQUIRED: "WHEN_REQUIRED"
};
var DEFAULT_REQUEST_CHECKSUM_CALCULATION = RequestChecksumCalculation.WHEN_SUPPORTED;
var ResponseChecksumValidation = {
	WHEN_SUPPORTED: "WHEN_SUPPORTED",
	WHEN_REQUIRED: "WHEN_REQUIRED"
};
var DEFAULT_RESPONSE_CHECKSUM_VALIDATION = RequestChecksumCalculation.WHEN_SUPPORTED;
var ChecksumAlgorithm;
(function(ChecksumAlgorithm) {
	ChecksumAlgorithm["MD5"] = "MD5";
	ChecksumAlgorithm["CRC32"] = "CRC32";
	ChecksumAlgorithm["CRC32C"] = "CRC32C";
	ChecksumAlgorithm["CRC64NVME"] = "CRC64NVME";
	ChecksumAlgorithm["SHA1"] = "SHA1";
	ChecksumAlgorithm["SHA256"] = "SHA256";
})(ChecksumAlgorithm || (ChecksumAlgorithm = {}));
var ChecksumLocation;
(function(ChecksumLocation) {
	ChecksumLocation["HEADER"] = "header";
	ChecksumLocation["TRAILER"] = "trailer";
})(ChecksumLocation || (ChecksumLocation = {}));
var DEFAULT_CHECKSUM_ALGORITHM = ChecksumAlgorithm.CRC32;
//#endregion
//#region ../../node_modules/@aws-sdk/checksums/dist-es/submodules/flexible-checksums/stringUnionSelector.js
var SelectorType$1;
(function(SelectorType) {
	SelectorType["ENV"] = "env";
	SelectorType["CONFIG"] = "shared config entry";
})(SelectorType$1 || (SelectorType$1 = {}));
var stringUnionSelector = (obj, key, union, type) => {
	if (!(key in obj)) return void 0;
	const value = obj[key].toUpperCase();
	if (!Object.values(union).includes(value)) throw new TypeError(`Cannot load ${type} '${key}'. Expected one of ${Object.values(union)}, got '${obj[key]}'.`);
	return value;
};
//#endregion
//#region ../../node_modules/@aws-sdk/checksums/dist-es/submodules/flexible-checksums/NODE_REQUEST_CHECKSUM_CALCULATION_CONFIG_OPTIONS.js
var ENV_REQUEST_CHECKSUM_CALCULATION = "AWS_REQUEST_CHECKSUM_CALCULATION";
var CONFIG_REQUEST_CHECKSUM_CALCULATION = "request_checksum_calculation";
var NODE_REQUEST_CHECKSUM_CALCULATION_CONFIG_OPTIONS = {
	environmentVariableSelector: (env) => stringUnionSelector(env, ENV_REQUEST_CHECKSUM_CALCULATION, RequestChecksumCalculation, SelectorType$1.ENV),
	configFileSelector: (profile) => stringUnionSelector(profile, CONFIG_REQUEST_CHECKSUM_CALCULATION, RequestChecksumCalculation, SelectorType$1.CONFIG),
	default: DEFAULT_REQUEST_CHECKSUM_CALCULATION
};
//#endregion
//#region ../../node_modules/@aws-sdk/checksums/dist-es/submodules/flexible-checksums/NODE_RESPONSE_CHECKSUM_VALIDATION_CONFIG_OPTIONS.js
var ENV_RESPONSE_CHECKSUM_VALIDATION = "AWS_RESPONSE_CHECKSUM_VALIDATION";
var CONFIG_RESPONSE_CHECKSUM_VALIDATION = "response_checksum_validation";
var NODE_RESPONSE_CHECKSUM_VALIDATION_CONFIG_OPTIONS = {
	environmentVariableSelector: (env) => stringUnionSelector(env, ENV_RESPONSE_CHECKSUM_VALIDATION, ResponseChecksumValidation, SelectorType$1.ENV),
	configFileSelector: (profile) => stringUnionSelector(profile, CONFIG_RESPONSE_CHECKSUM_VALIDATION, ResponseChecksumValidation, SelectorType$1.CONFIG),
	default: DEFAULT_RESPONSE_CHECKSUM_VALIDATION
};
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/client/emitWarningIfUnsupportedVersion.js
var state, emitWarningIfUnsupportedVersion$1;
var init_emitWarningIfUnsupportedVersion$1 = __esmMin((() => {
	state = { warningEmitted: false };
	emitWarningIfUnsupportedVersion$1 = (version) => {
		if (version && !state.warningEmitted) {
			if (process.env.AWS_SDK_JS_NODE_VERSION_SUPPORT_WARNING_DISABLED === "true") {
				state.warningEmitted = true;
				return;
			}
			const userMajorVersion = parseInt(version.substring(1, version.indexOf(".")));
			const vv = 22;
			if (userMajorVersion < vv) {
				state.warningEmitted = true;
				process.emitWarning(`NodeVersionSupportWarning: The AWS SDK for JavaScript (v3)
versions published after the first week of January 2027
will require node >=${vv}. You are running node ${version}.

To continue receiving updates to AWS services, bug fixes,
and security updates please upgrade to node >=${vv}.

More information can be found at: https://a.co/c895JFp`);
			}
		}
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/client/setCredentialFeature.js
function setCredentialFeature(credentials, feature, value) {
	if (!credentials.$source) credentials.$source = {};
	credentials.$source[feature] = value;
	return credentials;
}
var init_setCredentialFeature = __esmMin((() => {}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/retry/middleware-retry/isStreamingPayload/isStreamingPayload.js
var isStreamingPayload;
var init_isStreamingPayload = __esmMin((() => {
	isStreamingPayload = (request) => request?.body instanceof Readable || typeof ReadableStream !== "undefined" && request?.body instanceof ReadableStream;
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/client/middleware-stack/MiddlewareStack.js
var getAllAliases, getMiddlewareNameWithAliases, constructStack, stepWeights, priorityWeights;
var init_MiddlewareStack = __esmMin((() => {
	getAllAliases = (name, aliases) => {
		const _aliases = [];
		if (name) _aliases.push(name);
		if (aliases) for (const alias of aliases) _aliases.push(alias);
		return _aliases;
	};
	getMiddlewareNameWithAliases = (name, aliases) => {
		return `${name || "anonymous"}${aliases && aliases.length > 0 ? ` (a.k.a. ${aliases.join(",")})` : ""}`;
	};
	constructStack = () => {
		let absoluteEntries = [];
		let relativeEntries = [];
		let identifyOnResolve = false;
		const entriesNameSet = /* @__PURE__ */ new Set();
		const sort = (entries) => entries.sort((a, b) => stepWeights[b.step] - stepWeights[a.step] || priorityWeights[b.priority || "normal"] - priorityWeights[a.priority || "normal"]);
		const removeByName = (toRemove) => {
			let isRemoved = false;
			const filterCb = (entry) => {
				const aliases = getAllAliases(entry.name, entry.aliases);
				if (aliases.includes(toRemove)) {
					isRemoved = true;
					for (const alias of aliases) entriesNameSet.delete(alias);
					return false;
				}
				return true;
			};
			absoluteEntries = absoluteEntries.filter(filterCb);
			relativeEntries = relativeEntries.filter(filterCb);
			return isRemoved;
		};
		const removeByReference = (toRemove) => {
			let isRemoved = false;
			const filterCb = (entry) => {
				if (entry.middleware === toRemove) {
					isRemoved = true;
					for (const alias of getAllAliases(entry.name, entry.aliases)) entriesNameSet.delete(alias);
					return false;
				}
				return true;
			};
			absoluteEntries = absoluteEntries.filter(filterCb);
			relativeEntries = relativeEntries.filter(filterCb);
			return isRemoved;
		};
		const cloneTo = (toStack) => {
			absoluteEntries.forEach((entry) => {
				toStack.add(entry.middleware, { ...entry });
			});
			relativeEntries.forEach((entry) => {
				toStack.addRelativeTo(entry.middleware, { ...entry });
			});
			toStack.identifyOnResolve?.(stack.identifyOnResolve());
			return toStack;
		};
		const expandRelativeMiddlewareList = (from) => {
			const expandedMiddlewareList = [];
			from.before.forEach((entry) => {
				if (entry.before.length === 0 && entry.after.length === 0) expandedMiddlewareList.push(entry);
				else expandedMiddlewareList.push(...expandRelativeMiddlewareList(entry));
			});
			expandedMiddlewareList.push(from);
			from.after.reverse().forEach((entry) => {
				if (entry.before.length === 0 && entry.after.length === 0) expandedMiddlewareList.push(entry);
				else expandedMiddlewareList.push(...expandRelativeMiddlewareList(entry));
			});
			return expandedMiddlewareList;
		};
		const getMiddlewareList = (debug = false) => {
			const normalizedAbsoluteEntries = [];
			const normalizedRelativeEntries = [];
			const normalizedEntriesNameMap = {};
			absoluteEntries.forEach((entry) => {
				const normalizedEntry = {
					...entry,
					before: [],
					after: []
				};
				for (const alias of getAllAliases(normalizedEntry.name, normalizedEntry.aliases)) normalizedEntriesNameMap[alias] = normalizedEntry;
				normalizedAbsoluteEntries.push(normalizedEntry);
			});
			relativeEntries.forEach((entry) => {
				const normalizedEntry = {
					...entry,
					before: [],
					after: []
				};
				for (const alias of getAllAliases(normalizedEntry.name, normalizedEntry.aliases)) normalizedEntriesNameMap[alias] = normalizedEntry;
				normalizedRelativeEntries.push(normalizedEntry);
			});
			normalizedRelativeEntries.forEach((entry) => {
				if (entry.toMiddleware) {
					const toMiddleware = normalizedEntriesNameMap[entry.toMiddleware];
					if (toMiddleware === void 0) {
						if (debug) return;
						throw new Error(`${entry.toMiddleware} is not found when adding ${getMiddlewareNameWithAliases(entry.name, entry.aliases)} middleware ${entry.relation} ${entry.toMiddleware}`);
					}
					if (entry.relation === "after") toMiddleware.after.push(entry);
					if (entry.relation === "before") toMiddleware.before.push(entry);
				}
			});
			return sort(normalizedAbsoluteEntries).map(expandRelativeMiddlewareList).reduce((wholeList, expandedMiddlewareList) => {
				wholeList.push(...expandedMiddlewareList);
				return wholeList;
			}, []);
		};
		const stack = {
			add: (middleware, options = {}) => {
				const { name, override, aliases: _aliases } = options;
				const entry = {
					step: "initialize",
					priority: "normal",
					middleware,
					...options
				};
				const aliases = getAllAliases(name, _aliases);
				if (aliases.length > 0) {
					if (aliases.some((alias) => entriesNameSet.has(alias))) {
						if (!override) throw new Error(`Duplicate middleware name '${getMiddlewareNameWithAliases(name, _aliases)}'`);
						for (const alias of aliases) {
							const toOverrideIndex = absoluteEntries.findIndex((entry) => entry.name === alias || entry.aliases?.some((a) => a === alias));
							if (toOverrideIndex === -1) continue;
							const toOverride = absoluteEntries[toOverrideIndex];
							if (toOverride.step !== entry.step || entry.priority !== toOverride.priority) throw new Error(`"${getMiddlewareNameWithAliases(toOverride.name, toOverride.aliases)}" middleware with ${toOverride.priority} priority in ${toOverride.step} step cannot be overridden by "${getMiddlewareNameWithAliases(name, _aliases)}" middleware with ${entry.priority} priority in ${entry.step} step.`);
							absoluteEntries.splice(toOverrideIndex, 1);
						}
					}
					for (const alias of aliases) entriesNameSet.add(alias);
				}
				absoluteEntries.push(entry);
			},
			addRelativeTo: (middleware, options) => {
				const { name, override, aliases: _aliases } = options;
				const entry = {
					middleware,
					...options
				};
				const aliases = getAllAliases(name, _aliases);
				if (aliases.length > 0) {
					if (aliases.some((alias) => entriesNameSet.has(alias))) {
						if (!override) throw new Error(`Duplicate middleware name '${getMiddlewareNameWithAliases(name, _aliases)}'`);
						for (const alias of aliases) {
							const toOverrideIndex = relativeEntries.findIndex((entry) => entry.name === alias || entry.aliases?.some((a) => a === alias));
							if (toOverrideIndex === -1) continue;
							const toOverride = relativeEntries[toOverrideIndex];
							if (toOverride.toMiddleware !== entry.toMiddleware || toOverride.relation !== entry.relation) throw new Error(`"${getMiddlewareNameWithAliases(toOverride.name, toOverride.aliases)}" middleware ${toOverride.relation} "${toOverride.toMiddleware}" middleware cannot be overridden by "${getMiddlewareNameWithAliases(name, _aliases)}" middleware ${entry.relation} "${entry.toMiddleware}" middleware.`);
							relativeEntries.splice(toOverrideIndex, 1);
						}
					}
					for (const alias of aliases) entriesNameSet.add(alias);
				}
				relativeEntries.push(entry);
			},
			clone: () => cloneTo(constructStack()),
			use: (plugin) => {
				plugin.applyToStack(stack);
			},
			remove: (toRemove) => {
				if (typeof toRemove === "string") return removeByName(toRemove);
				else return removeByReference(toRemove);
			},
			removeByTag: (toRemove) => {
				let isRemoved = false;
				const filterCb = (entry) => {
					const { tags, name, aliases: _aliases } = entry;
					if (tags && tags.includes(toRemove)) {
						const aliases = getAllAliases(name, _aliases);
						for (const alias of aliases) entriesNameSet.delete(alias);
						isRemoved = true;
						return false;
					}
					return true;
				};
				absoluteEntries = absoluteEntries.filter(filterCb);
				relativeEntries = relativeEntries.filter(filterCb);
				return isRemoved;
			},
			concat: (from) => {
				const cloned = cloneTo(constructStack());
				cloned.use(from);
				cloned.identifyOnResolve(identifyOnResolve || cloned.identifyOnResolve() || (from.identifyOnResolve?.() ?? false));
				return cloned;
			},
			applyToStack: cloneTo,
			identify: () => {
				return getMiddlewareList(true).map((mw) => {
					const step = mw.step ?? mw.relation + " " + mw.toMiddleware;
					return getMiddlewareNameWithAliases(mw.name, mw.aliases) + " - " + step;
				});
			},
			identifyOnResolve(toggle) {
				if (typeof toggle === "boolean") identifyOnResolve = toggle;
				return identifyOnResolve;
			},
			resolve: (handler, context) => {
				for (const middleware of getMiddlewareList().map((entry) => entry.middleware).reverse()) handler = middleware(handler, context);
				if (identifyOnResolve) console.log(stack.identify());
				return handler;
			}
		};
		return stack;
	};
	stepWeights = {
		initialize: 5,
		serialize: 4,
		build: 3,
		finalizeRequest: 2,
		deserialize: 1
	};
	priorityWeights = {
		high: 3,
		normal: 2,
		low: 1
	};
}));
//#endregion
//#region ../../node_modules/@smithy/types/dist-es/endpoint.js
var EndpointURLScheme;
var init_endpoint = __esmMin((() => {
	(function(EndpointURLScheme) {
		EndpointURLScheme["HTTP"] = "http";
		EndpointURLScheme["HTTPS"] = "https";
	})(EndpointURLScheme || (EndpointURLScheme = {}));
}));
//#endregion
//#region ../../node_modules/@smithy/types/dist-es/extensions/checksum.js
var AlgorithmId;
var init_checksum$2 = __esmMin((() => {
	(function(AlgorithmId) {
		AlgorithmId["MD5"] = "md5";
		AlgorithmId["CRC32"] = "crc32";
		AlgorithmId["CRC32C"] = "crc32c";
		AlgorithmId["SHA1"] = "sha1";
		AlgorithmId["SHA256"] = "sha256";
	})(AlgorithmId || (AlgorithmId = {}));
}));
//#endregion
//#region ../../node_modules/@smithy/types/dist-es/extensions/index.js
var init_extensions$1 = __esmMin((() => {
	init_checksum$2();
}));
//#endregion
//#region ../../node_modules/@smithy/types/dist-es/middleware.js
var SMITHY_CONTEXT_KEY;
var init_middleware = __esmMin((() => {
	SMITHY_CONTEXT_KEY = "__smithy_context";
}));
//#endregion
//#region ../../node_modules/@smithy/types/dist-es/profile.js
var IniSectionType;
var init_profile = __esmMin((() => {
	(function(IniSectionType) {
		IniSectionType["PROFILE"] = "profile";
		IniSectionType["SSO_SESSION"] = "sso-session";
		IniSectionType["SERVICES"] = "services";
	})(IniSectionType || (IniSectionType = {}));
}));
//#endregion
//#region ../../node_modules/@smithy/types/dist-es/index.js
var init_dist_es$14 = __esmMin((() => {
	init_endpoint();
	init_extensions$1();
	init_middleware();
	init_profile();
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/transport/getSmithyContext.js
var getSmithyContext;
var init_getSmithyContext = __esmMin((() => {
	init_dist_es$14();
	getSmithyContext = (context) => context["__smithy_context"] || (context["__smithy_context"] = {});
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/transport/hasOwn.js
function hasOwn(o, k) {
	return Object.prototype.hasOwnProperty.call(o, k);
}
var init_hasOwn = __esmMin((() => {}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/transport/httpRequest.js
function cloneQuery(query) {
	return Object.keys(query).reduce((carry, paramName) => {
		const param = query[paramName];
		return {
			...carry,
			[paramName]: Array.isArray(param) ? [...param] : param
		};
	}, {});
}
var HttpRequest;
var init_httpRequest$1 = __esmMin((() => {
	HttpRequest = class HttpRequest {
		method;
		protocol;
		hostname;
		port;
		path;
		query;
		headers;
		username;
		password;
		fragment;
		body;
		constructor(options) {
			this.method = options.method || "GET";
			this.hostname = options.hostname || "localhost";
			this.port = options.port;
			this.query = options.query || {};
			this.headers = options.headers || {};
			this.body = options.body;
			this.protocol = options.protocol ? options.protocol.slice(-1) !== ":" ? `${options.protocol}:` : options.protocol : "https:";
			this.path = options.path ? options.path.charAt(0) !== "/" ? `/${options.path}` : options.path : "/";
			this.username = options.username;
			this.password = options.password;
			this.fragment = options.fragment;
		}
		static clone(request) {
			const cloned = new HttpRequest({
				...request,
				headers: { ...request.headers }
			});
			if (cloned.query) cloned.query = cloneQuery(cloned.query);
			return cloned;
		}
		static isInstance(request) {
			if (!request) return false;
			const req = request;
			return "method" in req && "protocol" in req && "hostname" in req && "path" in req && typeof req["query"] === "object" && typeof req["headers"] === "object";
		}
		clone() {
			return HttpRequest.clone(this);
		}
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/transport/httpResponse.js
var HttpResponse;
var init_httpResponse = __esmMin((() => {
	HttpResponse = class {
		statusCode;
		reason;
		headers;
		body;
		constructor(options) {
			this.statusCode = options.statusCode;
			this.reason = options.reason;
			this.headers = options.headers || {};
			this.body = options.body;
		}
		static isInstance(response) {
			if (!response) return false;
			const resp = response;
			return typeof resp.statusCode === "number" && typeof resp.headers === "object";
		}
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/transport/isValidHostLabel.js
var VALID_HOST_LABEL_REGEX, isValidHostLabel;
var init_isValidHostLabel = __esmMin((() => {
	VALID_HOST_LABEL_REGEX = new RegExp(`^(?!.*-$)(?!-)[a-zA-Z0-9-]{1,63}$`);
	isValidHostLabel = (value, allowSubDomains = false) => {
		if (!allowSubDomains) return VALID_HOST_LABEL_REGEX.test(value);
		const labels = value.split(".");
		for (const label of labels) if (!isValidHostLabel(label)) return false;
		return true;
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/transport/isValidHostname.js
function isValidHostname(hostname) {
	return /^[a-z0-9][a-z0-9.-]*[a-z0-9]$/.test(hostname);
}
var init_isValidHostname = __esmMin((() => {}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/transport/normalizeProvider.js
var normalizeProvider$1;
var init_normalizeProvider$1 = __esmMin((() => {
	normalizeProvider$1 = (input) => {
		if (typeof input === "function") return input;
		const promisified = Promise.resolve(input);
		return () => promisified;
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/transport/parseQueryString.js
function parseQueryString(querystring) {
	const query = {};
	querystring = querystring.replace(/^\?/, "");
	if (querystring) for (const pair of querystring.split("&")) {
		let [key, value = null] = pair.split("=");
		key = decodeURIComponent(key);
		if (value) value = decodeURIComponent(value);
		if (!(key in query)) query[key] = value;
		else if (Array.isArray(query[key])) query[key].push(value);
		else query[key] = [query[key], value];
	}
	return query;
}
var init_parseQueryString = __esmMin((() => {}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/transport/parseUrl.js
var parseUrl;
var init_parseUrl = __esmMin((() => {
	init_parseQueryString();
	parseUrl = (url) => {
		if (typeof url === "string") return parseUrl(new URL(url));
		const { hostname, pathname, port, protocol, search } = url;
		let query;
		if (search) query = parseQueryString(search);
		return {
			hostname,
			port: port ? parseInt(port) : void 0,
			protocol,
			path: pathname,
			query
		};
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/transport/toEndpointV1.js
var toEndpointV1;
var init_toEndpointV1$1 = __esmMin((() => {
	init_hasOwn();
	init_parseUrl();
	toEndpointV1 = (endpoint) => {
		if (typeof endpoint === "object") {
			if ("url" in endpoint) {
				const v1Endpoint = parseUrl(endpoint.url);
				if (endpoint.headers) {
					v1Endpoint.headers = {};
					for (const name in endpoint.headers) {
						if (!hasOwn(endpoint.headers, name)) continue;
						v1Endpoint.headers[name.toLowerCase()] = endpoint.headers[name].join(", ");
					}
				}
				return v1Endpoint;
			}
			return endpoint;
		}
		return parseUrl(endpoint);
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/transport/index.js
var init_transport = __esmMin((() => {
	init_getSmithyContext();
	init_hasOwn();
	init_httpRequest$1();
	init_httpResponse();
	init_isValidHostLabel();
	init_isValidHostname();
	init_normalizeProvider$1();
	init_parseUrl();
	init_toEndpointV1$1();
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/client/smithy-client/client.js
var Client;
var init_client$2 = __esmMin((() => {
	init_MiddlewareStack();
	Client = class {
		config;
		middlewareStack = constructStack();
		initConfig;
		handlers;
		constructor(config) {
			this.config = config;
			const { protocol, protocolSettings } = config;
			if (protocolSettings) {
				if (typeof protocol === "function") config.protocol = new protocol(protocolSettings);
			}
		}
		send(command, optionsOrCb, cb) {
			const options = typeof optionsOrCb !== "function" ? optionsOrCb : void 0;
			const callback = typeof optionsOrCb === "function" ? optionsOrCb : cb;
			const useHandlerCache = options === void 0 && this.config.cacheMiddleware === true;
			let handler;
			if (useHandlerCache) {
				if (!this.handlers) this.handlers = /* @__PURE__ */ new WeakMap();
				const handlers = this.handlers;
				if (handlers.has(command.constructor)) handler = handlers.get(command.constructor);
				else {
					handler = command.resolveMiddleware(this.middlewareStack, this.config, options);
					handlers.set(command.constructor, handler);
				}
			} else {
				delete this.handlers;
				handler = command.resolveMiddleware(this.middlewareStack, this.config, options);
			}
			if (callback) handler(command).then((result) => callback(null, result.output), (err) => callback(err)).catch(() => {});
			else return handler(command).then((result) => result.output);
		}
		destroy() {
			this.config?.requestHandler?.destroy?.();
			delete this.handlers;
		}
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/schema/deref.js
var deref;
var init_deref = __esmMin((() => {
	deref = (schemaRef) => {
		if (typeof schemaRef === "function") return schemaRef();
		return schemaRef;
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/schema/schemas/operation.js
var operation;
var init_operation = __esmMin((() => {
	operation = (namespace, name, traits, input, output) => ({
		name,
		namespace,
		traits,
		input,
		output
	});
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/schema/middleware/schemaDeserializationMiddleware.js
var schemaDeserializationMiddleware, findHeader;
var init_schemaDeserializationMiddleware = __esmMin((() => {
	init_transport();
	init_operation();
	schemaDeserializationMiddleware = (config) => (next, context) => async (args) => {
		const { response } = await next(args);
		const { operationSchema } = getSmithyContext(context);
		const [, ns, n, t, i, o] = operationSchema ?? [];
		try {
			return {
				response,
				output: await config.protocol.deserializeResponse(operation(ns, n, t, i, o), {
					...config,
					...context
				}, response)
			};
		} catch (error) {
			Object.defineProperty(error, "$response", {
				value: response,
				enumerable: false,
				writable: false,
				configurable: false
			});
			if (!("$metadata" in error)) {
				const hint = `Deserialization error: to see the raw response, inspect the hidden field {error}.$response on this object.`;
				try {
					error.message += "\n  " + hint;
				} catch (ignored) {
					if (!context.logger || context.logger?.constructor?.name === "NoOpLogger") console.warn(hint);
					else context.logger?.warn?.(hint);
				}
				if (typeof error.$responseBodyText !== "undefined") {
					if (error.$response) error.$response.body = error.$responseBodyText;
				}
				try {
					if (HttpResponse.isInstance(response)) {
						const { headers = {}, statusCode } = response;
						const headerEntries = Object.entries(headers);
						error.$metadata = {
							httpStatusCode: statusCode,
							requestId: findHeader(/^x-[\w-]+-request-?id$/, headerEntries),
							extendedRequestId: findHeader(/^x-[\w-]+-id-2$/, headerEntries),
							cfId: findHeader(/^x-[\w-]+-cf-id$/, headerEntries)
						};
					}
				} catch (ignored) {}
			}
			throw error;
		}
	};
	findHeader = (pattern, headers) => {
		return (headers.find(([k]) => {
			return k.match(pattern);
		}) || [void 0, void 0])[1];
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/schema/middleware/schemaSerializationMiddleware.js
var schemaSerializationMiddleware;
var init_schemaSerializationMiddleware = __esmMin((() => {
	init_transport();
	init_operation();
	schemaSerializationMiddleware = (config) => (next, context) => async (args) => {
		const { operationSchema } = getSmithyContext(context);
		const [, ns, n, t, i, o] = operationSchema ?? [];
		const endpoint = context.endpointV2 ? async () => toEndpointV1(context.endpointV2) : config.endpoint;
		const request = await config.protocol.serializeRequest(operation(ns, n, t, i, o), args.input, {
			...config,
			...context,
			endpoint
		});
		return next({
			...args,
			request
		});
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/schema/middleware/getSchemaSerdePlugin.js
function getSchemaSerdePlugin(config) {
	return { applyToStack: (commandStack) => {
		commandStack.add(schemaSerializationMiddleware(config), serializerMiddlewareOption$1);
		commandStack.add(schemaDeserializationMiddleware(config), deserializerMiddlewareOption);
		config.protocol.setSerdeContext(config);
	} };
}
var deserializerMiddlewareOption, serializerMiddlewareOption$1;
var init_getSchemaSerdePlugin = __esmMin((() => {
	init_schemaDeserializationMiddleware();
	init_schemaSerializationMiddleware();
	deserializerMiddlewareOption = {
		name: "deserializerMiddleware",
		step: "deserialize",
		tags: ["DESERIALIZER"],
		override: true
	};
	serializerMiddlewareOption$1 = {
		name: "serializerMiddleware",
		step: "serialize",
		tags: ["SERIALIZER"],
		override: true
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/schema/schemas/translateTraits.js
function translateTraits(indicator) {
	if (typeof indicator === "object") return indicator;
	indicator = indicator | 0;
	if (traitsCache[indicator]) return traitsCache[indicator];
	const traits = {};
	let i = 0;
	for (const trait of [
		"httpLabel",
		"idempotent",
		"idempotencyToken",
		"sensitive",
		"httpPayload",
		"httpResponseCode",
		"httpQueryParams"
	]) if ((indicator >> i++ & 1) === 1) traits[trait] = 1;
	return traitsCache[indicator] = traits;
}
var traitsCache;
var init_translateTraits = __esmMin((() => {
	traitsCache = [];
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/schema/schemas/NormalizedSchema.js
function member(memberSchema, memberName) {
	if (memberSchema instanceof NormalizedSchema) return Object.assign(memberSchema, {
		memberName,
		_isMemberSchema: true
	});
	return new NormalizedSchema(memberSchema, memberName);
}
var anno, simpleSchemaCacheN, simpleSchemaCacheS, NormalizedSchema, isMemberSchema, isStaticSchema;
var init_NormalizedSchema = __esmMin((() => {
	init_deref();
	init_translateTraits();
	anno = {
		it: Symbol.for("@smithy/nor-struct-it"),
		ns: Symbol.for("@smithy/ns")
	};
	simpleSchemaCacheN = [];
	simpleSchemaCacheS = {};
	NormalizedSchema = class NormalizedSchema {
		ref;
		memberName;
		static symbol = Symbol.for("@smithy/nor");
		symbol = NormalizedSchema.symbol;
		name;
		schema;
		_isMemberSchema;
		traits;
		memberTraits;
		normalizedTraits;
		constructor(ref, memberName) {
			this.ref = ref;
			this.memberName = memberName;
			const traitStack = [];
			let _ref = ref;
			let schema = ref;
			this._isMemberSchema = false;
			while (isMemberSchema(_ref)) {
				traitStack.push(_ref[1]);
				_ref = _ref[0];
				schema = deref(_ref);
				this._isMemberSchema = true;
			}
			if (traitStack.length > 0) {
				this.memberTraits = {};
				for (let i = traitStack.length - 1; i >= 0; --i) {
					const traitSet = traitStack[i];
					Object.assign(this.memberTraits, translateTraits(traitSet));
				}
			} else this.memberTraits = 0;
			if (schema instanceof NormalizedSchema) {
				const computedMemberTraits = this.memberTraits;
				Object.assign(this, schema);
				this.memberTraits = Object.assign({}, computedMemberTraits, schema.getMemberTraits(), this.getMemberTraits());
				this.normalizedTraits = void 0;
				this.memberName = memberName ?? schema.memberName;
				return;
			}
			this.schema = deref(schema);
			if (isStaticSchema(this.schema)) {
				this.name = `${this.schema[1]}#${this.schema[2]}`;
				this.traits = this.schema[3];
			} else {
				this.name = this.memberName ?? String(schema);
				this.traits = 0;
			}
			if (this._isMemberSchema && !memberName) throw new Error(`@smithy/core/schema - NormalizedSchema member init ${this.getName(true)} missing member name.`);
		}
		static [Symbol.hasInstance](lhs) {
			const isPrototype = this.prototype.isPrototypeOf(lhs);
			if (!isPrototype && typeof lhs === "object" && lhs !== null) return lhs.symbol === this.symbol;
			return isPrototype;
		}
		static of(ref) {
			const keyAble = typeof ref === "function" || typeof ref === "object" && ref !== null;
			if (typeof ref === "number") {
				if (simpleSchemaCacheN[ref]) return simpleSchemaCacheN[ref];
			} else if (typeof ref === "string") {
				if (simpleSchemaCacheS[ref]) return simpleSchemaCacheS[ref];
			} else if (keyAble) {
				if (ref[anno.ns]) return ref[anno.ns];
			}
			const sc = deref(ref);
			if (sc instanceof NormalizedSchema) return sc;
			if (isMemberSchema(sc)) {
				const [ns, traits] = sc;
				if (ns instanceof NormalizedSchema) {
					Object.assign(ns.getMergedTraits(), translateTraits(traits));
					return ns;
				}
				throw new Error(`@smithy/core/schema - may not init unwrapped member schema=${JSON.stringify(ref, null, 2)}.`);
			}
			const ns = new NormalizedSchema(sc);
			if (keyAble) return ref[anno.ns] = ns;
			if (typeof sc === "string") return simpleSchemaCacheS[sc] = ns;
			if (typeof sc === "number") return simpleSchemaCacheN[sc] = ns;
			return ns;
		}
		getSchema() {
			const sc = this.schema;
			if (Array.isArray(sc) && sc[0] === 0) return sc[4];
			return sc;
		}
		getName(withNamespace = false) {
			const { name } = this;
			return !withNamespace && name && name.includes("#") ? name.split("#")[1] : name || void 0;
		}
		getMemberName() {
			return this.memberName;
		}
		isMemberSchema() {
			return this._isMemberSchema;
		}
		isListSchema() {
			const sc = this.getSchema();
			return typeof sc === "number" ? sc >= 64 && sc < 128 : sc[0] === 1;
		}
		isMapSchema() {
			const sc = this.getSchema();
			return typeof sc === "number" ? sc >= 128 && sc <= 255 : sc[0] === 2;
		}
		isStructSchema() {
			const sc = this.getSchema();
			if (typeof sc !== "object") return false;
			const id = sc[0];
			return id === 3 || id === -3 || id === 4;
		}
		isUnionSchema() {
			const sc = this.getSchema();
			if (typeof sc !== "object") return false;
			return sc[0] === 4;
		}
		isBlobSchema() {
			const sc = this.getSchema();
			return sc === 21 || sc === 42;
		}
		isTimestampSchema() {
			const sc = this.getSchema();
			return typeof sc === "number" && sc >= 4 && sc <= 7;
		}
		isUnitSchema() {
			return this.getSchema() === "unit";
		}
		isDocumentSchema() {
			return this.getSchema() === 15;
		}
		isStringSchema() {
			return this.getSchema() === 0;
		}
		isBooleanSchema() {
			return this.getSchema() === 2;
		}
		isNumericSchema() {
			return this.getSchema() === 1;
		}
		isBigIntegerSchema() {
			return this.getSchema() === 17;
		}
		isBigDecimalSchema() {
			return this.getSchema() === 19;
		}
		isStreaming() {
			const { streaming } = this.getMergedTraits();
			return !!streaming || this.getSchema() === 42;
		}
		isIdempotencyToken() {
			return !!this.getMergedTraits().idempotencyToken;
		}
		getMergedTraits() {
			return this.normalizedTraits ?? (this.normalizedTraits = {
				...this.getOwnTraits(),
				...this.getMemberTraits()
			});
		}
		getMemberTraits() {
			return translateTraits(this.memberTraits);
		}
		getOwnTraits() {
			return translateTraits(this.traits);
		}
		getKeySchema() {
			const [isDoc, isMap] = [this.isDocumentSchema(), this.isMapSchema()];
			if (!isDoc && !isMap) throw new Error(`@smithy/core/schema - cannot get key for non-map: ${this.getName(true)}`);
			const schema = this.getSchema();
			return member([isDoc ? 15 : schema[4] ?? 0, 0], "key");
		}
		getValueSchema() {
			const sc = this.getSchema();
			const [isDoc, isMap, isList] = [
				this.isDocumentSchema(),
				this.isMapSchema(),
				this.isListSchema()
			];
			const memberSchema = typeof sc === "number" ? 63 & sc : sc && typeof sc === "object" && (isMap || isList) ? sc[3 + sc[0]] : isDoc ? 15 : void 0;
			if (memberSchema != null) return member([memberSchema, 0], isMap ? "value" : "member");
			throw new Error(`@smithy/core/schema - ${this.getName(true)} has no value member.`);
		}
		getMemberSchema(memberName) {
			const struct = this.getSchema();
			if (this.isStructSchema() && struct[4].includes(memberName)) {
				const i = struct[4].indexOf(memberName);
				const memberSchema = struct[5][i];
				return member(isMemberSchema(memberSchema) ? memberSchema : [memberSchema, 0], memberName);
			}
			if (this.isDocumentSchema()) return member([15, 0], memberName);
			throw new Error(`@smithy/core/schema - ${this.getName(true)} has no member=${memberName}.`);
		}
		getMemberSchemas() {
			const buffer = {};
			try {
				for (const [k, v] of this.structIterator()) buffer[k] = v;
			} catch (ignored) {}
			return buffer;
		}
		getEventStreamMember() {
			if (this.isStructSchema()) {
				for (const [memberName, memberSchema] of this.structIterator()) if (memberSchema.isStreaming() && memberSchema.isStructSchema()) return memberName;
			}
			return "";
		}
		*structIterator() {
			if (this.isUnitSchema()) return;
			if (!this.isStructSchema()) throw new Error("@smithy/core/schema - cannot iterate non-struct schema.");
			const struct = this.getSchema();
			const z = struct[4].length;
			let it = struct[anno.it];
			if (it && z === it.length) {
				yield* it;
				return;
			}
			it = Array(z);
			for (let i = 0; i < z; ++i) {
				const k = struct[4][i];
				const v = member([struct[5][i], 0], k);
				yield it[i] = [k, v];
			}
			struct[anno.it] = it;
		}
	};
	isMemberSchema = (sc) => Array.isArray(sc) && sc.length === 2;
	isStaticSchema = (sc) => Array.isArray(sc) && sc.length >= 5;
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/schema/TypeRegistry.js
var TypeRegistry;
var init_TypeRegistry = __esmMin((() => {
	TypeRegistry = class TypeRegistry {
		namespace;
		schemas;
		exceptions;
		static registries = /* @__PURE__ */ new Map();
		constructor(namespace, schemas = /* @__PURE__ */ new Map(), exceptions = /* @__PURE__ */ new Map()) {
			this.namespace = namespace;
			this.schemas = schemas;
			this.exceptions = exceptions;
			if (!TypeRegistry.registries.has(namespace)) TypeRegistry.registries.set(namespace, this);
		}
		static for(namespace) {
			return TypeRegistry.registries.get(namespace) ?? new TypeRegistry(namespace);
		}
		copyFrom(other) {
			const { schemas, exceptions } = this;
			for (const [k, v] of other.schemas) if (!schemas.has(k)) schemas.set(k, v);
			for (const [k, v] of other.exceptions) if (!exceptions.has(k)) exceptions.set(k, v);
		}
		register(shapeId, schema) {
			const qualifiedName = this.normalizeShapeId(shapeId);
			for (const r of [this, TypeRegistry.for(qualifiedName.split("#")[0])]) if (!r.schemas.has(qualifiedName)) r.schemas.set(qualifiedName, schema);
		}
		getSchema(shapeId) {
			const id = this.normalizeShapeId(shapeId);
			if (!this.schemas.has(id)) {
				if (!shapeId.includes("#")) {
					const suffix = "#" + shapeId;
					const candidates = [];
					for (const [shapeId, schema] of this.schemas.entries()) if (shapeId.endsWith(suffix)) candidates.push(schema);
					if (candidates.length === 1) return candidates[0];
				}
				throw new Error(`@smithy/core/schema - schema not found for ${id}`);
			}
			return this.schemas.get(id);
		}
		registerError(es, ctor) {
			const $error = es;
			const ns = $error[1];
			const qualifiedName = ns + "#" + $error[2];
			for (const r of [this, TypeRegistry.for(ns)]) if (!r.schemas.has(qualifiedName) && !r.exceptions.has($error)) {
				r.schemas.set(qualifiedName, $error);
				r.exceptions.set($error, ctor);
			}
		}
		getErrorCtor(es) {
			const $error = es;
			if (this.exceptions.has($error)) return this.exceptions.get($error);
			return TypeRegistry.for($error[1]).exceptions.get($error);
		}
		getBaseException() {
			for (const exceptionKey of this.exceptions.keys()) if (Array.isArray(exceptionKey)) {
				const [, ns, name] = exceptionKey;
				const id = ns + "#" + name;
				if (id.startsWith("smithy.ts.sdk.synthetic.") && id.endsWith("ServiceException")) return exceptionKey;
			}
		}
		find(predicate) {
			for (const schema of this.schemas.values()) if (predicate(schema)) return schema;
		}
		clear() {
			this.schemas.clear();
			this.exceptions.clear();
		}
		normalizeShapeId(shapeId) {
			if (shapeId.includes("#")) return shapeId;
			return this.namespace + "#" + shapeId;
		}
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/schema/index.js
var init_schema = __esmMin((() => {
	init_deref();
	init_getSchemaSerdePlugin();
	init_operation();
	init_NormalizedSchema();
	init_translateTraits();
	init_TypeRegistry();
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/client/smithy-client/schemaLogFilter.js
function schemaLogFilter(schema, data) {
	if (data == null) return data;
	const ns = NormalizedSchema.of(schema);
	if (ns.getMergedTraits().sensitive) return SENSITIVE_STRING;
	if (ns.isListSchema()) {
		if (!!ns.getValueSchema().getMergedTraits().sensitive) return SENSITIVE_STRING;
	} else if (ns.isMapSchema()) {
		if (!!ns.getKeySchema().getMergedTraits().sensitive || !!ns.getValueSchema().getMergedTraits().sensitive) return SENSITIVE_STRING;
	} else if (ns.isStructSchema() && typeof data === "object") {
		const object = data;
		const newObject = {};
		for (const [member, memberNs] of ns.structIterator()) if (object[member] != null) newObject[member] = schemaLogFilter(memberNs, object[member]);
		return newObject;
	}
	return data;
}
var SENSITIVE_STRING;
var init_schemaLogFilter = __esmMin((() => {
	init_schema();
	SENSITIVE_STRING = "***SensitiveInformation***";
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/client/smithy-client/command.js
var Command, ClassBuilder;
var init_command = __esmMin((() => {
	init_dist_es$14();
	init_MiddlewareStack();
	init_schemaLogFilter();
	Command = class {
		middlewareStack = constructStack();
		schema;
		static classBuilder() {
			return new ClassBuilder();
		}
		resolveMiddlewareWithContext(clientStack, configuration, options, { middlewareFn, clientName, commandName, inputFilterSensitiveLog, outputFilterSensitiveLog, smithyContext, additionalContext, CommandCtor }) {
			for (const mw of middlewareFn.bind(this)(CommandCtor, clientStack, configuration, options)) this.middlewareStack.use(mw);
			const stack = clientStack.concat(this.middlewareStack);
			const { logger } = configuration;
			const additionalSmithyContext = additionalContext[SMITHY_CONTEXT_KEY];
			const handlerExecutionContext = {
				logger,
				clientName,
				commandName,
				inputFilterSensitiveLog,
				outputFilterSensitiveLog,
				...additionalContext,
				[SMITHY_CONTEXT_KEY]: {
					...additionalSmithyContext,
					commandInstance: this,
					...smithyContext,
					...options?.metricsRecorder === void 0 ? {} : { metricsRecorder: options.metricsRecorder }
				}
			};
			const { requestHandler } = configuration;
			let requestOptions = options ?? {};
			if (requestOptions.metricsRecorder) {
				requestOptions = { ...requestOptions };
				delete requestOptions.metricsRecorder;
			}
			if (smithyContext.eventStream) requestOptions = {
				isEventStream: true,
				...requestOptions
			};
			return stack.resolve((request) => requestHandler.handle(request.request, requestOptions), handlerExecutionContext);
		}
	};
	ClassBuilder = class {
		_init = () => {};
		_ep = {};
		_middlewareFn = () => [];
		_commandName = "";
		_clientName = "";
		_additionalContext = {};
		_smithyContext = {};
		_inputFilterSensitiveLog = void 0;
		_outputFilterSensitiveLog = void 0;
		_serializer = null;
		_deserializer = null;
		_operationSchema;
		init(cb) {
			this._init = cb;
		}
		ep(endpointParameterInstructions) {
			this._ep = endpointParameterInstructions;
			return this;
		}
		m(middlewareSupplier) {
			this._middlewareFn = middlewareSupplier;
			return this;
		}
		s(service, operation, smithyContext = {}) {
			this._smithyContext = {
				service,
				operation,
				...smithyContext
			};
			return this;
		}
		c(additionalContext = {}) {
			this._additionalContext = additionalContext;
			return this;
		}
		n(clientName, commandName) {
			this._clientName = clientName;
			this._commandName = commandName;
			return this;
		}
		f(inputFilter = (_) => _, outputFilter = (_) => _) {
			this._inputFilterSensitiveLog = inputFilter;
			this._outputFilterSensitiveLog = outputFilter;
			return this;
		}
		ser(serializer) {
			this._serializer = serializer;
			return this;
		}
		de(deserializer) {
			this._deserializer = deserializer;
			return this;
		}
		sc(operation) {
			this._operationSchema = operation;
			this._smithyContext.operationSchema = operation;
			return this;
		}
		build() {
			const closure = this;
			let CommandRef;
			return CommandRef = class extends Command {
				input;
				static getEndpointParameterInstructions() {
					return closure._ep;
				}
				constructor(...[input]) {
					super();
					this.input = input ?? {};
					closure._init(this);
					this.schema = closure._operationSchema;
				}
				resolveMiddleware(stack, configuration, options) {
					const op = closure._operationSchema;
					const input = op?.[4] ?? op?.input;
					const output = op?.[5] ?? op?.output;
					return this.resolveMiddlewareWithContext(stack, configuration, options, {
						CommandCtor: CommandRef,
						middlewareFn: closure._middlewareFn,
						clientName: closure._clientName,
						commandName: closure._commandName,
						inputFilterSensitiveLog: closure._inputFilterSensitiveLog ?? (op ? schemaLogFilter.bind(null, input) : (_) => _),
						outputFilterSensitiveLog: closure._outputFilterSensitiveLog ?? (op ? schemaLogFilter.bind(null, output) : (_) => _),
						smithyContext: closure._smithyContext,
						additionalContext: closure._additionalContext
					});
				}
				serialize = closure._serializer;
				deserialize = closure._deserializer;
			};
		}
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/client/smithy-client/create-aggregated-client.js
var createAggregatedClient;
var init_create_aggregated_client = __esmMin((() => {
	createAggregatedClient = (commands, Client, options) => {
		for (const [command, CommandCtor] of Object.entries(commands)) {
			const methodImpl = async function(args, optionsOrCb, cb) {
				const command = new CommandCtor(args);
				if (typeof optionsOrCb === "function") this.send(command, optionsOrCb);
				else if (typeof cb === "function") {
					if (typeof optionsOrCb !== "object") throw new Error(`Expected http options but got ${typeof optionsOrCb}`);
					this.send(command, optionsOrCb || {}, cb);
				} else return this.send(command, optionsOrCb);
			};
			const methodName = (command[0].toLowerCase() + command.slice(1)).replace(/Command$/, "");
			Client.prototype[methodName] = methodImpl;
		}
		const { paginators = {}, waiters = {} } = options ?? {};
		for (const [paginatorName, paginatorFn] of Object.entries(paginators)) if (Client.prototype[paginatorName] === void 0) Client.prototype[paginatorName] = function(commandInput = {}, paginationConfiguration, ...rest) {
			return paginatorFn({
				...paginationConfiguration,
				client: this
			}, commandInput, ...rest);
		};
		for (const [waiterName, waiterFn] of Object.entries(waiters)) if (Client.prototype[waiterName] === void 0) Client.prototype[waiterName] = async function(commandInput = {}, waiterConfiguration, ...rest) {
			let config = waiterConfiguration;
			if (typeof waiterConfiguration === "number") config = { maxWaitTime: waiterConfiguration };
			return waiterFn({
				...config,
				client: this
			}, commandInput, ...rest);
		};
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/client/smithy-client/exceptions.js
var ServiceException, decorateServiceException;
var init_exceptions = __esmMin((() => {
	ServiceException = class ServiceException extends Error {
		$fault;
		$response;
		$retryable;
		$metadata;
		constructor(options) {
			super(options.message);
			Object.setPrototypeOf(this, Object.getPrototypeOf(this).constructor.prototype);
			this.name = options.name;
			this.$fault = options.$fault;
			this.$metadata = options.$metadata;
		}
		static isInstance(value) {
			if (!value) return false;
			const candidate = value;
			return ServiceException.prototype.isPrototypeOf(candidate) || Boolean(candidate.$fault) && Boolean(candidate.$metadata) && (candidate.$fault === "client" || candidate.$fault === "server");
		}
		static [Symbol.hasInstance](instance) {
			if (!instance) return false;
			const candidate = instance;
			if (this === ServiceException) return ServiceException.isInstance(instance);
			if (ServiceException.isInstance(instance)) {
				if (this.prototype.isPrototypeOf(instance)) return true;
				const targetName = this.name;
				if (!targetName || !candidate.name) return false;
				if (candidate.name === targetName) return true;
				let proto = Object.getPrototypeOf(candidate);
				while (proto && proto !== Object.prototype) {
					const ctorName = proto.constructor?.name;
					if (ctorName && ctorName !== "Error" && ctorName === targetName) return true;
					proto = Object.getPrototypeOf(proto);
				}
				return false;
			}
			return false;
		}
	};
	decorateServiceException = (exception, additions = {}) => {
		Object.entries(additions).filter(([, v]) => v !== void 0).forEach(([k, v]) => {
			if (exception[k] == void 0 || exception[k] === "") exception[k] = v;
		});
		exception.message = exception.message || exception.Message || "UnknownError";
		delete exception.Message;
		return exception;
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/client/smithy-client/defaults-mode.js
var loadConfigsForDefaultMode;
var init_defaults_mode = __esmMin((() => {
	loadConfigsForDefaultMode = (mode) => {
		switch (mode) {
			case "standard": return {
				retryMode: "standard",
				connectionTimeout: 3100
			};
			case "in-region": return {
				retryMode: "standard",
				connectionTimeout: 1100
			};
			case "cross-region": return {
				retryMode: "standard",
				connectionTimeout: 3100
			};
			case "mobile": return {
				retryMode: "standard",
				connectionTimeout: 3e4
			};
			default: return {};
		}
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/client/smithy-client/emitWarningIfUnsupportedVersion.js
var warningEmitted, emitWarningIfUnsupportedVersion;
var init_emitWarningIfUnsupportedVersion = __esmMin((() => {
	warningEmitted = false;
	emitWarningIfUnsupportedVersion = (version) => {
		if (version && !warningEmitted && parseInt(version.substring(1, version.indexOf("."))) < 16) warningEmitted = true;
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/client/smithy-client/extensions/checksum.js
var knownAlgorithms, getChecksumConfiguration, resolveChecksumRuntimeConfig;
var init_checksum$1 = __esmMin((() => {
	init_transport();
	init_dist_es$14();
	knownAlgorithms = Object.values(AlgorithmId);
	getChecksumConfiguration = (runtimeConfig) => {
		const checksumAlgorithms = [];
		for (const id in AlgorithmId) {
			if (!hasOwn(AlgorithmId, id)) continue;
			const algorithmId = AlgorithmId[id];
			if (runtimeConfig[algorithmId] === void 0) continue;
			checksumAlgorithms.push({
				algorithmId: () => algorithmId,
				checksumConstructor: () => runtimeConfig[algorithmId]
			});
		}
		for (const [id, ChecksumCtor] of Object.entries(runtimeConfig.checksumAlgorithms ?? {})) checksumAlgorithms.push({
			algorithmId: () => id,
			checksumConstructor: () => ChecksumCtor
		});
		return {
			addChecksumAlgorithm(algo) {
				runtimeConfig.checksumAlgorithms = runtimeConfig.checksumAlgorithms ?? {};
				const id = algo.algorithmId();
				const ctor = algo.checksumConstructor();
				if (knownAlgorithms.includes(id)) runtimeConfig.checksumAlgorithms[id.toUpperCase()] = ctor;
				else runtimeConfig.checksumAlgorithms[id] = ctor;
				checksumAlgorithms.push(algo);
			},
			checksumAlgorithms() {
				return checksumAlgorithms;
			}
		};
	};
	resolveChecksumRuntimeConfig = (clientConfig) => {
		const runtimeConfig = {};
		clientConfig.checksumAlgorithms().forEach((checksumAlgorithm) => {
			const id = checksumAlgorithm.algorithmId();
			if (knownAlgorithms.includes(id)) runtimeConfig[id] = checksumAlgorithm.checksumConstructor();
		});
		return runtimeConfig;
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/client/smithy-client/extensions/retry.js
var getRetryConfiguration, resolveRetryRuntimeConfig;
var init_retry$2 = __esmMin((() => {
	getRetryConfiguration = (runtimeConfig) => {
		return {
			setRetryStrategy(retryStrategy) {
				runtimeConfig.retryStrategy = retryStrategy;
			},
			retryStrategy() {
				return runtimeConfig.retryStrategy;
			}
		};
	};
	resolveRetryRuntimeConfig = (retryStrategyConfiguration) => {
		const runtimeConfig = {};
		runtimeConfig.retryStrategy = retryStrategyConfiguration.retryStrategy();
		return runtimeConfig;
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/client/smithy-client/extensions/defaultExtensionConfiguration.js
var getDefaultExtensionConfiguration, resolveDefaultRuntimeConfig;
var init_defaultExtensionConfiguration = __esmMin((() => {
	init_checksum$1();
	init_retry$2();
	getDefaultExtensionConfiguration = (runtimeConfig) => {
		return Object.assign(getChecksumConfiguration(runtimeConfig), getRetryConfiguration(runtimeConfig));
	};
	resolveDefaultRuntimeConfig = (config) => {
		return Object.assign(resolveChecksumRuntimeConfig(config), resolveRetryRuntimeConfig(config));
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/client/smithy-client/get-value-from-text-node.js
var getValueFromTextNode;
var init_get_value_from_text_node = __esmMin((() => {
	init_transport();
	getValueFromTextNode = (obj) => {
		const textNodeName = "#text";
		for (const key in obj) {
			if (!hasOwn(obj, key)) continue;
			if (obj[key][textNodeName] !== void 0) obj[key] = obj[key][textNodeName];
			else if (typeof obj[key] === "object" && obj[key] !== null) obj[key] = getValueFromTextNode(obj[key]);
		}
		return obj;
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/client/smithy-client/NoOpLogger.js
var NoOpLogger;
var init_NoOpLogger = __esmMin((() => {
	NoOpLogger = class {
		trace() {}
		debug() {}
		info() {}
		warn() {}
		error() {}
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/client/smithy-client/client-command-builder.js
function makeBuilder(common, service, name, ep) {
	return function makeCommand(added, plugins, op, $, smithyContext = {}) {
		const epMerged = Object.assign({}, common, added);
		return Command.classBuilder().ep(epMerged).m(function(CommandCtor, clientStack, config, options) {
			const list = plugins.call(this, CommandCtor, clientStack, config, options);
			list.unshift(ep(config, CommandCtor.getEndpointParameterInstructions()));
			return list;
		}).s(service, op, smithyContext).n(name, op.charAt(0).toUpperCase() + op.slice(1) + "Command").sc($).build();
	};
}
var init_client_command_builder = __esmMin((() => {
	init_command();
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/client/index.js
var init_client$1 = __esmMin((() => {
	init_MiddlewareStack();
	init_transport();
	init_client$2();
	init_command();
	init_create_aggregated_client();
	init_exceptions();
	init_defaults_mode();
	init_emitWarningIfUnsupportedVersion();
	init_defaultExtensionConfiguration();
	init_checksum$1();
	init_retry$2();
	init_get_value_from_text_node();
	init_NoOpLogger();
	init_schemaLogFilter();
	init_client_command_builder();
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/serde/is-array-buffer/is-array-buffer.js
var isArrayBuffer;
var init_is_array_buffer = __esmMin((() => {
	isArrayBuffer = (arg) => typeof ArrayBuffer === "function" && arg instanceof ArrayBuffer || Object.prototype.toString.call(arg) === "[object ArrayBuffer]";
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/serde/util-buffer-from/buffer-from.js
var fromArrayBuffer, fromString;
var init_buffer_from = __esmMin((() => {
	init_is_array_buffer();
	fromArrayBuffer = (input, offset = 0, length = input.byteLength - offset) => {
		if (!isArrayBuffer(input)) throw new TypeError(`The "input" argument must be ArrayBuffer. Received type ${typeof input} (${input})`);
		return Buffer.from(input, offset, length);
	};
	fromString = (input, encoding) => {
		if (typeof input !== "string") throw new TypeError(`The "input" argument must be of type string. Received type ${typeof input} (${input})`);
		return encoding ? Buffer.from(input, encoding) : Buffer.from(input);
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/serde/util-base64/fromBase64.js
var BASE64_REGEX, fromBase64;
var init_fromBase64 = __esmMin((() => {
	init_buffer_from();
	BASE64_REGEX = /^[A-Za-z0-9+/]*={0,2}$/;
	fromBase64 = (input) => {
		if (input.length * 3 % 4 !== 0) throw new TypeError(`Incorrect padding on base64 string.`);
		if (!BASE64_REGEX.exec(input)) throw new TypeError(`Invalid base64 string.`);
		const buffer = fromString(input, "base64");
		return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/serde/util-utf8/fromUtf8.js
var fromUtf8$1;
var init_fromUtf8 = __esmMin((() => {
	init_buffer_from();
	fromUtf8$1 = (input) => {
		const buf = fromString(input, "utf8");
		return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength / Uint8Array.BYTES_PER_ELEMENT);
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/serde/util-base64/toBase64.js
var toBase64$1;
var init_toBase64 = __esmMin((() => {
	init_buffer_from();
	init_fromUtf8();
	toBase64$1 = (_input) => {
		let input;
		if (typeof _input === "string") input = fromUtf8$1(_input);
		else input = _input;
		if (typeof input !== "object" || typeof input.byteOffset !== "number" || typeof input.byteLength !== "number") throw new Error("@smithy/util-base64: toBase64 encoder function only accepts string | Uint8Array.");
		return fromArrayBuffer(input.buffer, input.byteOffset, input.byteLength).toString("base64");
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/serde/util-stream/blob/Uint8ArrayBlobAdapter.js
function bindUint8ArrayBlobAdapter(toUtf8, fromUtf8, toBase64, fromBase64) {
	return class Uint8ArrayBlobAdapter extends Uint8Array {
		static fromString(source, encoding = "utf-8") {
			if (typeof source === "string") {
				if (encoding === "base64") return Uint8ArrayBlobAdapter.mutate(fromBase64(source));
				return Uint8ArrayBlobAdapter.mutate(fromUtf8(source));
			}
			throw new Error(`Unsupported conversion from ${typeof source} to Uint8ArrayBlobAdapter.`);
		}
		static mutate(source) {
			Object.setPrototypeOf(source, Uint8ArrayBlobAdapter.prototype);
			return source;
		}
		transformToString(encoding = "utf-8") {
			if (encoding === "base64") return toBase64(this);
			return toUtf8(this);
		}
	};
}
var init_Uint8ArrayBlobAdapter = __esmMin((() => {}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/serde/util-utf8/toUtf8.js
var toUtf8$1;
var init_toUtf8 = __esmMin((() => {
	init_buffer_from();
	toUtf8$1 = (input) => {
		if (typeof input === "string") return input;
		if (typeof input !== "object" || typeof input.byteOffset !== "number" || typeof input.byteLength !== "number") throw new Error("@smithy/util-utf8: toUtf8 encoder function only accepts string | Uint8Array.");
		return fromArrayBuffer(input.buffer, input.byteOffset, input.byteLength).toString("utf8");
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/serde/uuid/v4.js
function bindV4(getRandomValues) {
	if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return () => crypto.randomUUID();
	return () => {
		const rnds = /* @__PURE__ */ new Uint8Array(16);
		getRandomValues(rnds);
		rnds[6] = rnds[6] & 15 | 64;
		rnds[8] = rnds[8] & 63 | 128;
		return decimalToHex[rnds[0]] + decimalToHex[rnds[1]] + decimalToHex[rnds[2]] + decimalToHex[rnds[3]] + "-" + decimalToHex[rnds[4]] + decimalToHex[rnds[5]] + "-" + decimalToHex[rnds[6]] + decimalToHex[rnds[7]] + "-" + decimalToHex[rnds[8]] + decimalToHex[rnds[9]] + "-" + decimalToHex[rnds[10]] + decimalToHex[rnds[11]] + decimalToHex[rnds[12]] + decimalToHex[rnds[13]] + decimalToHex[rnds[14]] + decimalToHex[rnds[15]];
	};
}
var decimalToHex;
var init_v4 = __esmMin((() => {
	decimalToHex = Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/serde/parse-utils.js
var expectNumber, MAX_FLOAT, expectFloat32, expectLong, expectShort, expectByte, expectSizedInt, castInt, strictParseDouble, strictParseFloat32, NUMBER_REGEX, parseNumber, strictParseShort, strictParseByte, stackTraceWarning, logger;
var init_parse_utils = __esmMin((() => {
	expectNumber = (value) => {
		if (value === null || value === void 0) return;
		if (typeof value === "string") {
			const parsed = parseFloat(value);
			if (!Number.isNaN(parsed)) {
				if (String(parsed) !== String(value)) logger.warn(stackTraceWarning(`Expected number but observed string: ${value}`));
				return parsed;
			}
		}
		if (typeof value === "number") return value;
		throw new TypeError(`Expected number, got ${typeof value}: ${value}`);
	};
	MAX_FLOAT = Math.ceil(2 ** 127 * (2 - 2 ** -23));
	expectFloat32 = (value) => {
		const expected = expectNumber(value);
		if (expected !== void 0 && !Number.isNaN(expected) && expected !== Infinity && expected !== -Infinity) {
			if (Math.abs(expected) > MAX_FLOAT) throw new TypeError(`Expected 32-bit float, got ${value}`);
		}
		return expected;
	};
	expectLong = (value) => {
		if (value === null || value === void 0) return;
		if (Number.isInteger(value) && !Number.isNaN(value)) return value;
		throw new TypeError(`Expected integer, got ${typeof value}: ${value}`);
	};
	expectShort = (value) => expectSizedInt(value, 16);
	expectByte = (value) => expectSizedInt(value, 8);
	expectSizedInt = (value, size) => {
		const expected = expectLong(value);
		if (expected !== void 0 && castInt(expected, size) !== expected) throw new TypeError(`Expected ${size}-bit integer, got ${value}`);
		return expected;
	};
	castInt = (value, size) => {
		switch (size) {
			case 32: return Int32Array.of(value)[0];
			case 16: return Int16Array.of(value)[0];
			case 8: return Int8Array.of(value)[0];
		}
	};
	strictParseDouble = (value) => {
		if (typeof value == "string") return expectNumber(parseNumber(value));
		return expectNumber(value);
	};
	strictParseFloat32 = (value) => {
		if (typeof value == "string") return expectFloat32(parseNumber(value));
		return expectFloat32(value);
	};
	NUMBER_REGEX = /(-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)|(-?Infinity)|(NaN)/g;
	parseNumber = (value) => {
		const matches = value.match(NUMBER_REGEX);
		if (matches === null || matches[0].length !== value.length) throw new TypeError(`Expected real number, got implicit NaN`);
		return parseFloat(value);
	};
	strictParseShort = (value) => {
		if (typeof value === "string") return expectShort(parseNumber(value));
		return expectShort(value);
	};
	strictParseByte = (value) => {
		if (typeof value === "string") return expectByte(parseNumber(value));
		return expectByte(value);
	};
	stackTraceWarning = (message) => {
		return String(new TypeError(message).stack || message).split("\n").slice(0, 5).filter((s) => !s.includes("stackTraceWarning")).join("\n");
	};
	logger = { warn: console.warn };
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/serde/date-utils.js
function dateToUtcString(date) {
	const year = date.getUTCFullYear();
	const month = date.getUTCMonth();
	const dayOfWeek = date.getUTCDay();
	const dayOfMonthInt = date.getUTCDate();
	const hoursInt = date.getUTCHours();
	const minutesInt = date.getUTCMinutes();
	const secondsInt = date.getUTCSeconds();
	const dayOfMonthString = dayOfMonthInt < 10 ? `0${dayOfMonthInt}` : `${dayOfMonthInt}`;
	const hoursString = hoursInt < 10 ? `0${hoursInt}` : `${hoursInt}`;
	const minutesString = minutesInt < 10 ? `0${minutesInt}` : `${minutesInt}`;
	const secondsString = secondsInt < 10 ? `0${secondsInt}` : `${secondsInt}`;
	return `${DAYS[dayOfWeek]}, ${dayOfMonthString} ${MONTHS[month]} ${year} ${hoursString}:${minutesString}:${secondsString} GMT`;
}
var DAYS, MONTHS, RFC3339, parseRfc3339DateTime, RFC3339_WITH_OFFSET$1, parseRfc3339DateTimeWithOffset, IMF_FIXDATE$1, RFC_850_DATE$1, ASC_TIME$1, parseRfc7231DateTime, parseEpochTimestamp, buildDate, parseTwoDigitYear, FIFTY_YEARS_IN_MILLIS, adjustRfc850Year, parseMonthByShortName, DAYS_IN_MONTH, validateDayOfMonth, isLeapYear, parseDateValue, parseMilliseconds, parseOffsetToMilliseconds, stripLeadingZeroes;
var init_date_utils = __esmMin((() => {
	init_parse_utils();
	DAYS = [
		"Sun",
		"Mon",
		"Tue",
		"Wed",
		"Thu",
		"Fri",
		"Sat"
	];
	MONTHS = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec"
	];
	RFC3339 = /* @__PURE__ */ new RegExp(/^(\d{4})-(\d{2})-(\d{2})[tT](\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?[zZ]$/);
	parseRfc3339DateTime = (value) => {
		if (value === null || value === void 0) return;
		if (typeof value !== "string") throw new TypeError("RFC-3339 date-times must be expressed as strings");
		const match = RFC3339.exec(value);
		if (!match) throw new TypeError("Invalid RFC-3339 date-time value");
		const [_, yearStr, monthStr, dayStr, hours, minutes, seconds, fractionalMilliseconds] = match;
		const year = strictParseShort(stripLeadingZeroes(yearStr));
		const month = parseDateValue(monthStr, "month", 1, 12);
		const day = parseDateValue(dayStr, "day", 1, 31);
		return buildDate(year, month, day, {
			hours,
			minutes,
			seconds,
			fractionalMilliseconds
		});
	};
	RFC3339_WITH_OFFSET$1 = /* @__PURE__ */ new RegExp(/^(\d{4})-(\d{2})-(\d{2})[tT](\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?(([-+]\d{2}:\d{2})|[zZ])$/);
	parseRfc3339DateTimeWithOffset = (value) => {
		if (value === null || value === void 0) return;
		if (typeof value !== "string") throw new TypeError("RFC-3339 date-times must be expressed as strings");
		const match = RFC3339_WITH_OFFSET$1.exec(value);
		if (!match) throw new TypeError("Invalid RFC-3339 date-time value");
		const [_, yearStr, monthStr, dayStr, hours, minutes, seconds, fractionalMilliseconds, offsetStr] = match;
		const year = strictParseShort(stripLeadingZeroes(yearStr));
		const month = parseDateValue(monthStr, "month", 1, 12);
		const day = parseDateValue(dayStr, "day", 1, 31);
		const date = buildDate(year, month, day, {
			hours,
			minutes,
			seconds,
			fractionalMilliseconds
		});
		if (offsetStr.toUpperCase() != "Z") date.setTime(date.getTime() - parseOffsetToMilliseconds(offsetStr));
		return date;
	};
	IMF_FIXDATE$1 = /* @__PURE__ */ new RegExp(/^(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun), (\d{2}) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4}) (\d{1,2}):(\d{2}):(\d{2})(?:\.(\d+))? GMT$/);
	RFC_850_DATE$1 = /* @__PURE__ */ new RegExp(/^(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday), (\d{2})-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-(\d{2}) (\d{1,2}):(\d{2}):(\d{2})(?:\.(\d+))? GMT$/);
	ASC_TIME$1 = /* @__PURE__ */ new RegExp(/^(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) ( [1-9]|\d{2}) (\d{1,2}):(\d{2}):(\d{2})(?:\.(\d+))? (\d{4})$/);
	parseRfc7231DateTime = (value) => {
		if (value === null || value === void 0) return;
		if (typeof value !== "string") throw new TypeError("RFC-7231 date-times must be expressed as strings");
		let match = IMF_FIXDATE$1.exec(value);
		if (match) {
			const [_, dayStr, monthStr, yearStr, hours, minutes, seconds, fractionalMilliseconds] = match;
			return buildDate(strictParseShort(stripLeadingZeroes(yearStr)), parseMonthByShortName(monthStr), parseDateValue(dayStr, "day", 1, 31), {
				hours,
				minutes,
				seconds,
				fractionalMilliseconds
			});
		}
		match = RFC_850_DATE$1.exec(value);
		if (match) {
			const [_, dayStr, monthStr, yearStr, hours, minutes, seconds, fractionalMilliseconds] = match;
			return adjustRfc850Year(buildDate(parseTwoDigitYear(yearStr), parseMonthByShortName(monthStr), parseDateValue(dayStr, "day", 1, 31), {
				hours,
				minutes,
				seconds,
				fractionalMilliseconds
			}));
		}
		match = ASC_TIME$1.exec(value);
		if (match) {
			const [_, monthStr, dayStr, hours, minutes, seconds, fractionalMilliseconds, yearStr] = match;
			return buildDate(strictParseShort(stripLeadingZeroes(yearStr)), parseMonthByShortName(monthStr), parseDateValue(dayStr.trimLeft(), "day", 1, 31), {
				hours,
				minutes,
				seconds,
				fractionalMilliseconds
			});
		}
		throw new TypeError("Invalid RFC-7231 date-time value");
	};
	parseEpochTimestamp = (value) => {
		if (value === null || value === void 0) return;
		let valueAsDouble;
		if (typeof value === "number") valueAsDouble = value;
		else if (typeof value === "string") valueAsDouble = strictParseDouble(value);
		else if (typeof value === "object" && value.tag === 1) valueAsDouble = value.value;
		else throw new TypeError("Epoch timestamps must be expressed as floating point numbers or their string representation");
		if (Number.isNaN(valueAsDouble) || valueAsDouble === Infinity || valueAsDouble === -Infinity) throw new TypeError("Epoch timestamps must be valid, non-Infinite, non-NaN numerics");
		return new Date(Math.round(valueAsDouble * 1e3));
	};
	buildDate = (year, month, day, time) => {
		const adjustedMonth = month - 1;
		validateDayOfMonth(year, adjustedMonth, day);
		return new Date(Date.UTC(year, adjustedMonth, day, parseDateValue(time.hours, "hour", 0, 23), parseDateValue(time.minutes, "minute", 0, 59), parseDateValue(time.seconds, "seconds", 0, 60), parseMilliseconds(time.fractionalMilliseconds)));
	};
	parseTwoDigitYear = (value) => {
		const thisYear = (/* @__PURE__ */ new Date()).getUTCFullYear();
		const valueInThisCentury = Math.floor(thisYear / 100) * 100 + strictParseShort(stripLeadingZeroes(value));
		if (valueInThisCentury < thisYear) return valueInThisCentury + 100;
		return valueInThisCentury;
	};
	FIFTY_YEARS_IN_MILLIS = 15768e8;
	adjustRfc850Year = (input) => {
		if (input.getTime() - (/* @__PURE__ */ new Date()).getTime() > FIFTY_YEARS_IN_MILLIS) return new Date(Date.UTC(input.getUTCFullYear() - 100, input.getUTCMonth(), input.getUTCDate(), input.getUTCHours(), input.getUTCMinutes(), input.getUTCSeconds(), input.getUTCMilliseconds()));
		return input;
	};
	parseMonthByShortName = (value) => {
		const monthIdx = MONTHS.indexOf(value);
		if (monthIdx < 0) throw new TypeError(`Invalid month: ${value}`);
		return monthIdx + 1;
	};
	DAYS_IN_MONTH = [
		31,
		28,
		31,
		30,
		31,
		30,
		31,
		31,
		30,
		31,
		30,
		31
	];
	validateDayOfMonth = (year, month, day) => {
		let maxDays = DAYS_IN_MONTH[month];
		if (month === 1 && isLeapYear(year)) maxDays = 29;
		if (day > maxDays) throw new TypeError(`Invalid day for ${MONTHS[month]} in ${year}: ${day}`);
	};
	isLeapYear = (year) => {
		return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
	};
	parseDateValue = (value, type, lower, upper) => {
		const dateVal = strictParseByte(stripLeadingZeroes(value));
		if (dateVal < lower || dateVal > upper) throw new TypeError(`${type} must be between ${lower} and ${upper}, inclusive`);
		return dateVal;
	};
	parseMilliseconds = (value) => {
		if (value === null || value === void 0) return 0;
		return strictParseFloat32("0." + value) * 1e3;
	};
	parseOffsetToMilliseconds = (value) => {
		const directionStr = value[0];
		let direction = 1;
		if (directionStr == "+") direction = 1;
		else if (directionStr == "-") direction = -1;
		else throw new TypeError(`Offset direction, ${directionStr}, must be "+" or "-"`);
		const hour = Number(value.substring(1, 3));
		const minute = Number(value.substring(4, 6));
		return direction * (hour * 60 + minute) * 60 * 1e3;
	};
	stripLeadingZeroes = (value) => {
		let idx = 0;
		while (idx < value.length - 1 && value.charAt(idx) === "0") idx++;
		if (idx === 0) return value;
		return value.slice(idx);
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/serde/lazy-json.js
var LazyJsonString;
var init_lazy_json = __esmMin((() => {
	LazyJsonString = function LazyJsonString(val) {
		return Object.assign(new String(val), {
			deserializeJSON() {
				return JSON.parse(String(val));
			},
			toString() {
				return String(val);
			},
			toJSON() {
				return String(val);
			}
		});
	};
	LazyJsonString.from = (object) => {
		if (object && typeof object === "object" && (object instanceof LazyJsonString || "deserializeJSON" in object)) return object;
		else if (typeof object === "string" || Object.getPrototypeOf(object) === String.prototype) return LazyJsonString(String(object));
		return LazyJsonString(JSON.stringify(object));
	};
	LazyJsonString.fromObject = LazyJsonString.from;
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/serde/quote-header.js
function quoteHeader(part) {
	if (part.includes(",") || part.includes("\"")) part = `"${part.replace(/"/g, "\\\"")}"`;
	return part;
}
var init_quote_header = __esmMin((() => {}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/serde/schema-serde-lib/schema-date-utils.js
function range(v, min, max) {
	const _v = Number(v);
	if (_v < min || _v > max) throw new Error(`Value ${_v} out of range [${min}, ${max}]`);
}
var ddd, mmm, time, date, year, RFC3339_WITH_OFFSET, IMF_FIXDATE, RFC_850_DATE, ASC_TIME, months, _parseEpochTimestamp, _parseRfc3339DateTimeWithOffset, _parseRfc7231DateTime;
var init_schema_date_utils = __esmMin((() => {
	ddd = `(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)(?:[ne|u?r]?s?day)?`;
	mmm = `(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)`;
	time = `(\\d?\\d):(\\d{2}):(\\d{2})(?:\\.(\\d+))?`;
	date = `(\\d?\\d)`;
	year = `(\\d{4})`;
	RFC3339_WITH_OFFSET = /* @__PURE__ */ new RegExp(/^(\d{4})-(\d\d)-(\d\d)[tT](\d\d):(\d\d):(\d\d)(\.(\d+))?(([-+]\d\d:\d\d)|[zZ])$/);
	IMF_FIXDATE = new RegExp(`^${ddd}, ${date} ${mmm} ${year} ${time} GMT$`);
	RFC_850_DATE = new RegExp(`^${ddd}, ${date}-${mmm}-(\\d\\d) ${time} GMT$`);
	ASC_TIME = new RegExp(`^${ddd} ${mmm} ( [1-9]|\\d\\d) ${time} ${year}$`);
	months = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec"
	];
	_parseEpochTimestamp = (value) => {
		if (value == null) return;
		let num = NaN;
		if (typeof value === "number") num = value;
		else if (typeof value === "string") {
			if (!/^-?\d*\.?\d+$/.test(value)) throw new TypeError(`parseEpochTimestamp - numeric string invalid.`);
			num = Number.parseFloat(value);
		} else if (typeof value === "object" && value.tag === 1) num = value.value;
		if (isNaN(num) || Math.abs(num) === Infinity) throw new TypeError("Epoch timestamps must be valid finite numbers.");
		return new Date(Math.round(num * 1e3));
	};
	_parseRfc3339DateTimeWithOffset = (value) => {
		if (value == null) return;
		if (typeof value !== "string") throw new TypeError("RFC3339 timestamps must be strings");
		const matches = RFC3339_WITH_OFFSET.exec(value);
		if (!matches) throw new TypeError(`Invalid RFC3339 timestamp format ${value}`);
		const [, yearStr, monthStr, dayStr, hours, minutes, seconds, , ms, offsetStr] = matches;
		range(monthStr, 1, 12);
		range(dayStr, 1, 31);
		range(hours, 0, 23);
		range(minutes, 0, 59);
		range(seconds, 0, 60);
		const date = new Date(Date.UTC(Number(yearStr), Number(monthStr) - 1, Number(dayStr), Number(hours), Number(minutes), Number(seconds), Number(ms) ? Math.round(parseFloat(`0.${ms}`) * 1e3) : 0));
		date.setUTCFullYear(Number(yearStr));
		if (offsetStr.toUpperCase() != "Z") {
			const [, sign, offsetH, offsetM] = /([+-])(\d\d):(\d\d)/.exec(offsetStr) || [
				void 0,
				"+",
				0,
				0
			];
			const scalar = sign === "-" ? 1 : -1;
			date.setTime(date.getTime() + scalar * (Number(offsetH) * 60 * 60 * 1e3 + Number(offsetM) * 60 * 1e3));
		}
		return date;
	};
	_parseRfc7231DateTime = (value) => {
		if (value == null) return;
		if (typeof value !== "string") throw new TypeError("RFC7231 timestamps must be strings.");
		let day;
		let month;
		let year;
		let hour;
		let minute;
		let second;
		let fraction;
		let matches;
		if (matches = IMF_FIXDATE.exec(value)) [, day, month, year, hour, minute, second, fraction] = matches;
		else if (matches = RFC_850_DATE.exec(value)) {
			[, day, month, year, hour, minute, second, fraction] = matches;
			year = (Number(year) + 1900).toString();
		} else if (matches = ASC_TIME.exec(value)) [, month, day, hour, minute, second, fraction, year] = matches;
		if (year && second) {
			const timestamp = Date.UTC(Number(year), months.indexOf(month), Number(day), Number(hour), Number(minute), Number(second), fraction ? Math.round(parseFloat(`0.${fraction}`) * 1e3) : 0);
			range(day, 1, 31);
			range(hour, 0, 23);
			range(minute, 0, 59);
			range(second, 0, 60);
			const date = new Date(timestamp);
			date.setUTCFullYear(Number(year));
			return date;
		}
		throw new TypeError(`Invalid RFC7231 date-time value ${value}.`);
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/serde/split-every.js
function splitEvery(value, delimiter, numDelimiters) {
	if (numDelimiters <= 0 || !Number.isInteger(numDelimiters)) throw new Error("Invalid number of delimiters (" + numDelimiters + ") for splitEvery.");
	const segments = value.split(delimiter);
	if (numDelimiters === 1) return segments;
	const compoundSegments = [];
	let currentSegment = "";
	for (let i = 0; i < segments.length; i++) {
		if (currentSegment === "") currentSegment = segments[i];
		else currentSegment += delimiter + segments[i];
		if ((i + 1) % numDelimiters === 0) {
			compoundSegments.push(currentSegment);
			currentSegment = "";
		}
	}
	if (currentSegment !== "") compoundSegments.push(currentSegment);
	return compoundSegments;
}
var init_split_every = __esmMin((() => {}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/serde/split-header.js
var splitHeader;
var init_split_header = __esmMin((() => {
	splitHeader = (value) => {
		const z = value.length;
		const values = [];
		let withinQuotes = false;
		let prevChar = void 0;
		let anchor = 0;
		for (let i = 0; i < z; ++i) {
			const char = value[i];
			switch (char) {
				case `"`:
					if (prevChar !== "\\") withinQuotes = !withinQuotes;
					break;
				case ",": if (!withinQuotes) {
					values.push(value.slice(anchor, i));
					anchor = i + 1;
				}
			}
			prevChar = char;
		}
		values.push(value.slice(anchor));
		return values.map((v) => {
			v = v.trim();
			const z = v.length;
			if (z < 2) return v;
			if (v[0] === `"` && v[z - 1] === `"`) v = v.slice(1, z - 1);
			return v.replace(/\\"/g, "\"");
		});
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/serde/value/NumericValue.js
var format, NumericValue;
var init_NumericValue = __esmMin((() => {
	format = /^-?((0|[1-9]\d*)(\.\d+)?|\.\d+)([eE][+-]?\d+)?$/;
	NumericValue = class NumericValue {
		string;
		type;
		constructor(string, type) {
			this.string = string;
			this.type = type;
			if (!format.test(string)) throw new Error(`@smithy/core/serde - NumericValue string must conform to the Smithy bigDecimal format. Received: "${string}"`);
		}
		toString() {
			return this.string;
		}
		static [Symbol.hasInstance](object) {
			if (!object || typeof object !== "object") return false;
			const _nv = object;
			return NumericValue.prototype.isPrototypeOf(object) || _nv.type === "bigDecimal" && format.test(_nv.string);
		}
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/serde/util-hex-encoding/hex-encoding.js
function fromHex(encoded) {
	if (encoded.length % 2 !== 0) throw new Error("Hex encoded strings must have an even number length");
	const out = new Uint8Array(encoded.length / 2);
	for (let i = 0; i < encoded.length; i += 2) {
		const encodedByte = encoded.slice(i, i + 2).toLowerCase();
		if (encodedByte in HEX_TO_SHORT) out[i / 2] = HEX_TO_SHORT[encodedByte];
		else throw new Error(`Cannot decode unrecognized sequence ${encodedByte} as hexadecimal`);
	}
	return out;
}
function toHex(bytes) {
	let out = "";
	for (let i = 0; i < bytes.byteLength; i++) out += SHORT_TO_HEX[bytes[i]];
	return out;
}
var SHORT_TO_HEX, HEX_TO_SHORT;
var init_hex_encoding = __esmMin((() => {
	SHORT_TO_HEX = {};
	HEX_TO_SHORT = {};
	for (let i = 0; i < 256; i++) {
		let encodedByte = i.toString(16).toLowerCase();
		if (encodedByte.length === 1) encodedByte = `0${encodedByte}`;
		SHORT_TO_HEX[i] = encodedByte;
		HEX_TO_SHORT[encodedByte] = i;
	}
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/serde/util-body-length/calculateBodyLength.js
var calculateBodyLength;
var init_calculateBodyLength = __esmMin((() => {
	calculateBodyLength = (body) => {
		if (!body) return 0;
		if (typeof body === "string") return Buffer.byteLength(body);
		else if (typeof body.byteLength === "number") return body.byteLength;
		else if (typeof body.size === "number") return body.size;
		else if (typeof body.start === "number" && typeof body.end === "number") return body.end + 1 - body.start;
		else if (body instanceof ReadStream) {
			if (body.path != null) return lstatSync(body.path).size;
			else if (typeof body.fd === "number") return fstatSync(body.fd).size;
		}
		throw new Error(`Body Length computation failed for ${body}`);
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/serde/util-utf8/toUint8Array.js
var toUint8Array;
var init_toUint8Array = __esmMin((() => {
	init_fromUtf8();
	toUint8Array = (data) => {
		if (data instanceof Uint8Array) return data;
		if (typeof data === "string") return fromUtf8$1(data);
		if (ArrayBuffer.isView(data)) return new Uint8Array(data.buffer, data.byteOffset, data.byteLength / Uint8Array.BYTES_PER_ELEMENT);
		return new Uint8Array(data);
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/serde/concatBytes.js
function concatBytes(arrays, length) {
	if (length === void 0) {
		length = 0;
		for (const bytes of arrays) length += bytes.byteLength;
	}
	const result = new Uint8Array(length);
	let offset = 0;
	for (const buf of arrays) {
		result.set(buf, offset);
		offset += buf.byteLength;
	}
	return result;
}
var init_concatBytes = __esmMin((() => {}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/config/property-provider/ProviderError.js
var ProviderError;
var init_ProviderError = __esmMin((() => {
	ProviderError = class ProviderError extends Error {
		name = "ProviderError";
		tryNextLink;
		constructor(message, options = true) {
			let logger;
			let tryNextLink = true;
			if (typeof options === "boolean") {
				logger = void 0;
				tryNextLink = options;
			} else if (options != null && typeof options === "object") {
				logger = options.logger;
				tryNextLink = options.tryNextLink ?? true;
			}
			super(message);
			this.tryNextLink = tryNextLink;
			Object.setPrototypeOf(this, ProviderError.prototype);
			logger?.debug?.(`@smithy/property-provider ${tryNextLink ? "->" : "(!)"} ${message}`);
		}
		static from(error, options = true) {
			return Object.assign(new this(error.message, options), error);
		}
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/config/property-provider/CredentialsProviderError.js
var CredentialsProviderError;
var init_CredentialsProviderError = __esmMin((() => {
	init_ProviderError();
	CredentialsProviderError = class CredentialsProviderError extends ProviderError {
		name = "CredentialsProviderError";
		constructor(message, options = true) {
			super(message, options);
			Object.setPrototypeOf(this, CredentialsProviderError.prototype);
		}
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/config/property-provider/TokenProviderError.js
var TokenProviderError;
var init_TokenProviderError = __esmMin((() => {
	init_ProviderError();
	TokenProviderError = class TokenProviderError extends ProviderError {
		name = "TokenProviderError";
		constructor(message, options = true) {
			super(message, options);
			Object.setPrototypeOf(this, TokenProviderError.prototype);
		}
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/config/property-provider/chain.js
var chain;
var init_chain = __esmMin((() => {
	init_ProviderError();
	chain = (...providers) => async () => {
		if (providers.length === 0) throw new ProviderError("No providers in chain");
		let lastProviderError;
		for (const provider of providers) try {
			return await provider();
		} catch (err) {
			lastProviderError = err;
			if (err?.tryNextLink) continue;
			throw err;
		}
		throw lastProviderError;
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/config/property-provider/fromValue.js
var fromValue;
var init_fromValue = __esmMin((() => {
	fromValue = (staticValue) => () => Promise.resolve(staticValue);
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/config/property-provider/memoize.js
var memoize;
var init_memoize = __esmMin((() => {
	memoize = (provider, isExpired, requiresRefresh) => {
		let resolved;
		let pending;
		let hasResult;
		let isConstant = false;
		const coalesceProvider = async () => {
			if (!pending) pending = provider();
			try {
				resolved = await pending;
				hasResult = true;
				isConstant = false;
			} finally {
				pending = void 0;
			}
			return resolved;
		};
		if (isExpired === void 0) return async (options) => {
			if (!hasResult || options?.forceRefresh) resolved = await coalesceProvider();
			return resolved;
		};
		return async (options) => {
			if (!hasResult || options?.forceRefresh) resolved = await coalesceProvider();
			if (isConstant) return resolved;
			if (requiresRefresh && !requiresRefresh(resolved)) {
				isConstant = true;
				return resolved;
			}
			if (isExpired(resolved)) {
				await coalesceProvider();
				return resolved;
			}
			return resolved;
		};
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/config/util-config-provider/booleanSelector.js
var booleanSelector;
var init_booleanSelector = __esmMin((() => {
	booleanSelector = (obj, key, type) => {
		if (!(key in obj)) return void 0;
		if (obj[key] === "true") return true;
		if (obj[key] === "false") return false;
		throw new Error(`Cannot load ${type} "${key}". Expected "true" or "false", got ${obj[key]}.`);
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/config/util-config-provider/types.js
var SelectorType;
var init_types$1 = __esmMin((() => {
	(function(SelectorType) {
		SelectorType["ENV"] = "env";
		SelectorType["CONFIG"] = "shared config entry";
	})(SelectorType || (SelectorType = {}));
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/getHomeDir.js
var homeDirCache, getHomeDirCacheKey, getHomeDir;
var init_getHomeDir = __esmMin((() => {
	homeDirCache = {};
	getHomeDirCacheKey = () => {
		if (process && process.geteuid) return `${process.geteuid()}`;
		return "DEFAULT";
	};
	getHomeDir = () => {
		const { HOME, USERPROFILE, HOMEPATH, HOMEDRIVE = `C:${sep}` } = process.env;
		if (HOME) return HOME;
		if (USERPROFILE) return USERPROFILE;
		if (HOMEPATH) return `${HOMEDRIVE}${HOMEPATH}`;
		const homeDirCacheKey = getHomeDirCacheKey();
		if (!homeDirCache[homeDirCacheKey]) homeDirCache[homeDirCacheKey] = homedir();
		return homeDirCache[homeDirCacheKey];
	};
})), getProfileName;
var init_getProfileName = __esmMin((() => {
	getProfileName = (init) => init.profile || process.env["AWS_PROFILE"] || "default";
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/getSSOTokenFilepath.js
var getSSOTokenFilepath;
var init_getSSOTokenFilepath = __esmMin((() => {
	init_getHomeDir();
	getSSOTokenFilepath = (id) => {
		const cacheName = createHash("sha1").update(id).digest("hex");
		return join(getHomeDir(), ".aws", "sso", "cache", `${cacheName}.json`);
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/getSSOTokenFromFile.js
var tokenIntercept, getSSOTokenFromFile;
var init_getSSOTokenFromFile = __esmMin((() => {
	init_getSSOTokenFilepath();
	tokenIntercept = {};
	getSSOTokenFromFile = async (id) => {
		if (tokenIntercept[id]) return tokenIntercept[id];
		const ssoTokenFilepath = getSSOTokenFilepath(id);
		const ssoTokenText = await readFile(ssoTokenFilepath, "utf8");
		return JSON.parse(ssoTokenText);
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/constants.js
var init_constants$7 = __esmMin((() => {}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/getConfigData.js
var getConfigData;
var init_getConfigData = __esmMin((() => {
	init_dist_es$14();
	init_constants$7();
	getConfigData = (data) => Object.entries(data).filter(([key]) => {
		const indexOfSeparator = key.indexOf(".");
		if (indexOfSeparator === -1) return false;
		return Object.values(IniSectionType).includes(key.substring(0, indexOfSeparator));
	}).reduce((acc, [key, value]) => {
		const indexOfSeparator = key.indexOf(".");
		const updatedKey = key.substring(0, indexOfSeparator) === IniSectionType.PROFILE ? key.substring(indexOfSeparator + 1) : key;
		acc[updatedKey] = value;
		return acc;
	}, { ...data.default && { default: data.default } });
})), getConfigFilepath;
var init_getConfigFilepath = __esmMin((() => {
	init_getHomeDir();
	getConfigFilepath = () => process.env["AWS_CONFIG_FILE"] || join(getHomeDir(), ".aws", "config");
})), getCredentialsFilepath;
var init_getCredentialsFilepath = __esmMin((() => {
	init_getHomeDir();
	getCredentialsFilepath = () => process.env["AWS_SHARED_CREDENTIALS_FILE"] || join(getHomeDir(), ".aws", "credentials");
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/parseIni.js
var prefixKeyRegex, profileNameBlockList, parseIni;
var init_parseIni = __esmMin((() => {
	init_dist_es$14();
	init_constants$7();
	prefixKeyRegex = /^([\w-]+)\s(["'])?([\w-@+.%:/]+)\2$/;
	profileNameBlockList = ["__proto__", "profile __proto__"];
	parseIni = (iniData) => {
		const map = {};
		let currentSection;
		let currentSubSection;
		for (const iniLine of iniData.split(/\r?\n/)) {
			const trimmedLine = iniLine.split(/(^|\s)[;#]/)[0].trim();
			if (trimmedLine[0] === "[" && trimmedLine[trimmedLine.length - 1] === "]") {
				currentSection = void 0;
				currentSubSection = void 0;
				const sectionName = trimmedLine.substring(1, trimmedLine.length - 1);
				const matches = prefixKeyRegex.exec(sectionName);
				if (matches) {
					const [, prefix, , name] = matches;
					if (Object.values(IniSectionType).includes(prefix)) currentSection = [prefix, name].join(".");
				} else currentSection = sectionName;
				if (profileNameBlockList.includes(sectionName)) throw new Error(`Found invalid profile name "${sectionName}"`);
			} else if (currentSection) {
				const indexOfEqualsSign = trimmedLine.indexOf("=");
				if (![0, -1].includes(indexOfEqualsSign)) {
					const [name, value] = [trimmedLine.substring(0, indexOfEqualsSign).trim(), trimmedLine.substring(indexOfEqualsSign + 1).trim()];
					if (value === "") currentSubSection = name;
					else {
						if (currentSubSection && iniLine.trimStart() === iniLine) currentSubSection = void 0;
						map[currentSection] = map[currentSection] || {};
						const key = currentSubSection ? [currentSubSection, name].join(".") : name;
						map[currentSection][key] = value;
					}
				}
			}
		}
		return map;
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/readFile.js
var filePromises, fileIntercept, readFile$1;
var init_readFile = __esmMin((() => {
	filePromises = {};
	fileIntercept = {};
	readFile$1 = (path, options) => {
		if (fileIntercept[path] !== void 0) return fileIntercept[path];
		if (!filePromises[path] || options?.ignoreCache) filePromises[path] = readFile(path, "utf8");
		return filePromises[path];
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/loadSharedConfigFiles.js
var swallowError$1, loadSharedConfigFiles;
var init_loadSharedConfigFiles = __esmMin((() => {
	init_getConfigData();
	init_getConfigFilepath();
	init_getCredentialsFilepath();
	init_getHomeDir();
	init_parseIni();
	init_readFile();
	init_constants$7();
	swallowError$1 = () => ({});
	loadSharedConfigFiles = async (init = {}) => {
		const { filepath = getCredentialsFilepath(), configFilepath = getConfigFilepath() } = init;
		const homeDir = getHomeDir();
		const relativeHomeDirPrefix = "~/";
		let resolvedFilepath = filepath;
		if (filepath.startsWith(relativeHomeDirPrefix)) resolvedFilepath = join(homeDir, filepath.slice(2));
		let resolvedConfigFilepath = configFilepath;
		if (configFilepath.startsWith(relativeHomeDirPrefix)) resolvedConfigFilepath = join(homeDir, configFilepath.slice(2));
		const parsedFiles = await Promise.all([readFile$1(resolvedConfigFilepath, { ignoreCache: init.ignoreCache }).then(parseIni).then(getConfigData).catch(swallowError$1), readFile$1(resolvedFilepath, { ignoreCache: init.ignoreCache }).then(parseIni).catch(swallowError$1)]);
		return {
			configFile: parsedFiles[0],
			credentialsFile: parsedFiles[1]
		};
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/getSsoSessionData.js
var getSsoSessionData;
var init_getSsoSessionData = __esmMin((() => {
	init_dist_es$14();
	init_loadSharedConfigFiles();
	getSsoSessionData = (data) => Object.entries(data).filter(([key]) => key.startsWith(IniSectionType.SSO_SESSION + ".")).reduce((acc, [key, value]) => ({
		...acc,
		[key.substring(key.indexOf(".") + 1)]: value
	}), {});
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/loadSsoSessionData.js
var swallowError, loadSsoSessionData;
var init_loadSsoSessionData = __esmMin((() => {
	init_getConfigFilepath();
	init_getSsoSessionData();
	init_parseIni();
	init_readFile();
	swallowError = () => ({});
	loadSsoSessionData = async (init = {}) => readFile$1(init.configFilepath ?? getConfigFilepath()).then(parseIni).then(getSsoSessionData).catch(swallowError);
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/mergeConfigFiles.js
var mergeConfigFiles;
var init_mergeConfigFiles = __esmMin((() => {
	mergeConfigFiles = (...files) => {
		const merged = {};
		for (const file of files) for (const [key, values] of Object.entries(file)) if (merged[key] !== void 0) Object.assign(merged[key], values);
		else merged[key] = values;
		return merged;
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/parseKnownFiles.js
var parseKnownFiles;
var init_parseKnownFiles = __esmMin((() => {
	init_loadSharedConfigFiles();
	init_mergeConfigFiles();
	parseKnownFiles = async (init) => {
		const parsedFiles = await loadSharedConfigFiles(init);
		return mergeConfigFiles(parsedFiles.configFile, parsedFiles.credentialsFile);
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/externalDataInterceptor.js
var externalDataInterceptor;
var init_externalDataInterceptor = __esmMin((() => {
	init_getSSOTokenFromFile();
	init_readFile();
	externalDataInterceptor = {
		getFileRecord() {
			return fileIntercept;
		},
		interceptFile(path, contents) {
			fileIntercept[path] = Promise.resolve(contents);
		},
		getTokenRecord() {
			return tokenIntercept;
		},
		interceptToken(id, contents) {
			tokenIntercept[id] = contents;
		}
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/config/node-config-provider/getSelectorName.js
function getSelectorName(functionString) {
	try {
		const constants = new Set(Array.from(functionString.match(/([A-Z_]){3,}/g) ?? []));
		constants.delete("CONFIG");
		constants.delete("CONFIG_PREFIX_SEPARATOR");
		constants.delete("ENV");
		return [...constants].join(", ");
	} catch (ignored) {
		return functionString;
	}
}
var init_getSelectorName = __esmMin((() => {}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/config/node-config-provider/fromEnv.js
var fromEnv$1;
var init_fromEnv$1 = __esmMin((() => {
	init_CredentialsProviderError();
	init_getSelectorName();
	fromEnv$1 = (envVarSelector, options) => async () => {
		try {
			const config = envVarSelector(process.env, options);
			if (config === void 0) throw new Error();
			return config;
		} catch (e) {
			throw new CredentialsProviderError(e.message || `Not found in ENV: ${getSelectorName(envVarSelector.toString())}`, { logger: options?.logger });
		}
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/config/node-config-provider/fromSharedConfigFiles.js
var fromSharedConfigFiles;
var init_fromSharedConfigFiles = __esmMin((() => {
	init_CredentialsProviderError();
	init_getProfileName();
	init_loadSharedConfigFiles();
	init_getSelectorName();
	fromSharedConfigFiles = (configSelector, { preferredFile = "config", ...init } = {}) => async () => {
		const profile = getProfileName(init);
		const { configFile, credentialsFile } = await loadSharedConfigFiles(init);
		const profileFromCredentials = credentialsFile[profile] || {};
		const profileFromConfig = configFile[profile] || {};
		const mergedProfile = preferredFile === "config" ? {
			...profileFromCredentials,
			...profileFromConfig
		} : {
			...profileFromConfig,
			...profileFromCredentials
		};
		try {
			const configValue = configSelector(mergedProfile, preferredFile === "config" ? configFile : credentialsFile);
			if (configValue === void 0) throw new Error();
			return configValue;
		} catch (e) {
			throw new CredentialsProviderError(e.message || `Not found in config files w/ profile [${profile}]: ${getSelectorName(configSelector.toString())}`, { logger: init.logger });
		}
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/config/node-config-provider/fromStatic.js
var isFunction, fromStatic;
var init_fromStatic = __esmMin((() => {
	init_fromValue();
	isFunction = (func) => typeof func === "function";
	fromStatic = (defaultValue) => isFunction(defaultValue) ? async () => await defaultValue() : fromValue(defaultValue);
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/config/node-config-provider/configLoader.js
var loadConfig;
var init_configLoader = __esmMin((() => {
	init_chain();
	init_memoize();
	init_fromEnv$1();
	init_fromSharedConfigFiles();
	init_fromStatic();
	loadConfig = ({ environmentVariableSelector, configFileSelector, default: defaultValue }, configuration = {}) => {
		const { signingName, logger } = configuration;
		return memoize(chain(fromEnv$1(environmentVariableSelector, {
			signingName,
			logger
		}), fromSharedConfigFiles(configFileSelector, configuration), fromStatic(defaultValue)));
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/config/config-resolver/endpointsConfig/NodeUseDualstackEndpointConfigOptions.js
var ENV_USE_DUALSTACK_ENDPOINT, CONFIG_USE_DUALSTACK_ENDPOINT, NODE_USE_DUALSTACK_ENDPOINT_CONFIG_OPTIONS;
var init_NodeUseDualstackEndpointConfigOptions = __esmMin((() => {
	init_booleanSelector();
	init_types$1();
	ENV_USE_DUALSTACK_ENDPOINT = "AWS_USE_DUALSTACK_ENDPOINT";
	CONFIG_USE_DUALSTACK_ENDPOINT = "use_dualstack_endpoint";
	NODE_USE_DUALSTACK_ENDPOINT_CONFIG_OPTIONS = {
		environmentVariableSelector: (env) => booleanSelector(env, ENV_USE_DUALSTACK_ENDPOINT, SelectorType.ENV),
		configFileSelector: (profile) => booleanSelector(profile, CONFIG_USE_DUALSTACK_ENDPOINT, SelectorType.CONFIG),
		default: false
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/config/config-resolver/endpointsConfig/NodeUseFipsEndpointConfigOptions.js
var ENV_USE_FIPS_ENDPOINT, CONFIG_USE_FIPS_ENDPOINT, NODE_USE_FIPS_ENDPOINT_CONFIG_OPTIONS;
var init_NodeUseFipsEndpointConfigOptions = __esmMin((() => {
	init_booleanSelector();
	init_types$1();
	ENV_USE_FIPS_ENDPOINT = "AWS_USE_FIPS_ENDPOINT";
	CONFIG_USE_FIPS_ENDPOINT = "use_fips_endpoint";
	NODE_USE_FIPS_ENDPOINT_CONFIG_OPTIONS = {
		environmentVariableSelector: (env) => booleanSelector(env, ENV_USE_FIPS_ENDPOINT, SelectorType.ENV),
		configFileSelector: (profile) => booleanSelector(profile, CONFIG_USE_FIPS_ENDPOINT, SelectorType.CONFIG),
		default: false
	};
})), DEFAULTS_MODE_OPTIONS, IMDS_TOKEN_PATH$1, X_AWS_EC2_METADATA_TOKEN_TTL;
var init_constants$6 = __esmMin((() => {
	DEFAULTS_MODE_OPTIONS = [
		"in-region",
		"cross-region",
		"mobile",
		"standard",
		"legacy"
	];
	IMDS_TOKEN_PATH$1 = "/latest/api/token";
	X_AWS_EC2_METADATA_TOKEN_TTL = "x-aws-ec2-metadata-token-ttl-seconds";
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/config/config-resolver/regionConfig/getInstanceMetadataRegion.js
var TIMEOUT_MS, NEG_CACHE_TTL_MS, negativeCacheUntil, getInstanceMetadataRegion, cacheNegativeAndReturnUndefined, resolveImdsEndpoint, imdsRequest;
var init_getInstanceMetadataRegion = __esmMin((() => {
	init_constants$6();
	TIMEOUT_MS = 1e3;
	NEG_CACHE_TTL_MS = 6e4;
	negativeCacheUntil = 0;
	getInstanceMetadataRegion = async () => {
		if (process.env["AWS_EC2_METADATA_DISABLED"]) return;
		if (Date.now() < negativeCacheUntil) return;
		try {
			const endpoint = resolveImdsEndpoint();
			const token = (await imdsRequest({
				...endpoint,
				path: IMDS_TOKEN_PATH$1,
				method: "PUT",
				headers: { [X_AWS_EC2_METADATA_TOKEN_TTL]: "21600" }
			})).toString();
			return (await imdsRequest({
				...endpoint,
				path: "/latest/meta-data/placement/region",
				method: "GET",
				headers: { ["x-aws-ec2-metadata-token"]: token }
			})).toString().trim() || cacheNegativeAndReturnUndefined();
		} catch {
			return cacheNegativeAndReturnUndefined();
		}
	};
	cacheNegativeAndReturnUndefined = () => {
		negativeCacheUntil = Date.now() + NEG_CACHE_TTL_MS;
	};
	resolveImdsEndpoint = () => {
		const envEndpoint = process.env.AWS_EC2_METADATA_SERVICE_ENDPOINT;
		if (envEndpoint) {
			const url = new URL(envEndpoint);
			return {
				hostname: url.hostname.replace(/^\[(.+)]$/, "$1"),
				port: url.port ? Number(url.port) : void 0
			};
		}
		if (process.env.AWS_EC2_METADATA_SERVICE_ENDPOINT_MODE === "IPv6") return { hostname: "fd00:ec2::254" };
		return { hostname: "169.254.169.254" };
	};
	imdsRequest = async (options) => {
		const { request } = await import("node:http");
		return new Promise((resolve, reject) => {
			const req = request({
				hostname: options.hostname,
				port: options.port,
				path: options.path,
				method: options.method,
				headers: options.headers,
				timeout: TIMEOUT_MS,
				signal: AbortSignal.timeout(TIMEOUT_MS)
			});
			req.on("error", (err) => {
				reject(err);
				req.destroy();
			});
			req.on("timeout", () => {
				reject(/* @__PURE__ */ new Error("TimeoutError from instance metadata service"));
				req.destroy();
			});
			req.on("response", (res) => {
				const { statusCode = 400 } = res;
				if (statusCode < 200 || statusCode >= 300) {
					reject(Object.assign(/* @__PURE__ */ new Error("Error response received from instance metadata service"), { statusCode }));
					req.destroy();
					return;
				}
				const chunks = [];
				res.on("data", (chunk) => chunks.push(chunk));
				res.on("end", () => {
					resolve(Buffer.concat(chunks));
					req.destroy();
				});
			});
			req.end();
		});
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/config/config-resolver/regionConfig/config.js
var REGION_ENV_NAME, REGION_INI_NAME, NODE_REGION_CONFIG_OPTIONS, NODE_REGION_CONFIG_FILE_OPTIONS;
var init_config$2 = __esmMin((() => {
	init_getInstanceMetadataRegion();
	REGION_ENV_NAME = "AWS_REGION";
	REGION_INI_NAME = "region";
	NODE_REGION_CONFIG_OPTIONS = {
		environmentVariableSelector: (env) => env[REGION_ENV_NAME],
		configFileSelector: (profile) => profile[REGION_INI_NAME],
		default: async () => {
			const region = await getInstanceMetadataRegion();
			if (region) return region;
			throw new Error("Region is missing");
		}
	};
	NODE_REGION_CONFIG_FILE_OPTIONS = { preferredFile: "credentials" };
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/config/config-resolver/regionConfig/checkRegion.js
var validRegions, checkRegion;
var init_checkRegion = __esmMin((() => {
	init_transport();
	validRegions = /* @__PURE__ */ new Set();
	checkRegion = (region, check = isValidHostLabel) => {
		if (!validRegions.has(region) && !check(region)) {
			if (region === "*") console.warn(`@smithy/config-resolver WARN - Please use the caller region instead of "*". See "sigv4a" in https://github.com/aws/aws-sdk-js-v3/blob/main/supplemental-docs/CLIENTS.md.`);
			else throw new Error(`Region not accepted: region="${region}" is not a valid hostname component.`);
		} else validRegions.add(region);
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/config/config-resolver/regionConfig/isFipsRegion.js
var isFipsRegion;
var init_isFipsRegion = __esmMin((() => {
	isFipsRegion = (region) => typeof region === "string" && (region.startsWith("fips-") || region.endsWith("-fips"));
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/config/config-resolver/regionConfig/getRealRegion.js
var getRealRegion;
var init_getRealRegion = __esmMin((() => {
	init_isFipsRegion();
	getRealRegion = (region) => isFipsRegion(region) ? ["fips-aws-global", "aws-fips"].includes(region) ? "us-east-1" : region.replace(/fips-(dkr-|prod-)?|-fips/, "") : region;
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/config/config-resolver/regionConfig/resolveRegionConfig.js
var resolveRegionConfig;
var init_resolveRegionConfig = __esmMin((() => {
	init_checkRegion();
	init_getRealRegion();
	init_isFipsRegion();
	resolveRegionConfig = (input) => {
		const { region, useFipsEndpoint } = input;
		if (!region) throw new Error("Region is missing");
		return Object.assign(input, {
			region: async () => {
				const providedRegion = typeof region === "function" ? await region() : region;
				const realRegion = getRealRegion(providedRegion);
				checkRegion(realRegion);
				return realRegion;
			},
			useFipsEndpoint: async () => {
				const providedRegion = typeof region === "string" ? region : await region();
				if (isFipsRegion(providedRegion)) return true;
				return typeof useFipsEndpoint !== "function" ? Promise.resolve(!!useFipsEndpoint) : useFipsEndpoint();
			}
		});
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/config/defaults-mode/defaultsModeConfig.js
var AWS_DEFAULTS_MODE_ENV, AWS_DEFAULTS_MODE_CONFIG, NODE_DEFAULTS_MODE_CONFIG_OPTIONS;
var init_defaultsModeConfig = __esmMin((() => {
	AWS_DEFAULTS_MODE_ENV = "AWS_DEFAULTS_MODE";
	AWS_DEFAULTS_MODE_CONFIG = "defaults_mode";
	NODE_DEFAULTS_MODE_CONFIG_OPTIONS = {
		environmentVariableSelector: (env) => {
			return env[AWS_DEFAULTS_MODE_ENV];
		},
		configFileSelector: (profile) => {
			return profile[AWS_DEFAULTS_MODE_CONFIG];
		},
		default: "legacy"
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/config/defaults-mode/resolveDefaultsModeConfig.js
var resolveDefaultsModeConfig, resolveNodeDefaultsModeAuto, inferPhysicalRegion;
var init_resolveDefaultsModeConfig = __esmMin((() => {
	init_config$2();
	init_getInstanceMetadataRegion();
	init_configLoader();
	init_memoize();
	init_constants$6();
	init_defaultsModeConfig();
	resolveDefaultsModeConfig = ({ region = loadConfig(NODE_REGION_CONFIG_OPTIONS), defaultsMode = loadConfig(NODE_DEFAULTS_MODE_CONFIG_OPTIONS) } = {}) => memoize(async () => {
		const mode = typeof defaultsMode === "function" ? await defaultsMode() : defaultsMode;
		switch (mode?.toLowerCase()) {
			case "auto": return resolveNodeDefaultsModeAuto(region);
			case "in-region":
			case "cross-region":
			case "mobile":
			case "standard":
			case "legacy": return Promise.resolve(mode?.toLocaleLowerCase());
			case void 0: return Promise.resolve("legacy");
			default: throw new Error(`Invalid parameter for "defaultsMode", expect ${DEFAULTS_MODE_OPTIONS.join(", ")}, got ${mode}`);
		}
	});
	resolveNodeDefaultsModeAuto = async (clientRegion) => {
		if (clientRegion) {
			const resolvedRegion = typeof clientRegion === "function" ? await clientRegion() : clientRegion;
			const inferredRegion = await inferPhysicalRegion();
			if (!inferredRegion) return "standard";
			if (resolvedRegion === inferredRegion) return "in-region";
			else return "cross-region";
		}
		return "standard";
	};
	inferPhysicalRegion = async () => {
		if (process.env["AWS_EXECUTION_ENV"] && (process.env["AWS_REGION"] || process.env["AWS_DEFAULT_REGION"])) return process.env["AWS_REGION"] ?? process.env["AWS_DEFAULT_REGION"];
		return getInstanceMetadataRegion();
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/config/index.js
var init_config$1 = __esmMin((() => {
	init_ProviderError();
	init_CredentialsProviderError();
	init_TokenProviderError();
	init_chain();
	init_fromValue();
	init_memoize();
	init_booleanSelector();
	init_types$1();
	init_getHomeDir();
	init_getProfileName();
	init_getSSOTokenFilepath();
	init_getSSOTokenFromFile();
	init_constants$7();
	init_loadSharedConfigFiles();
	init_loadSsoSessionData();
	init_parseKnownFiles();
	init_externalDataInterceptor();
	init_readFile();
	init_configLoader();
	init_fromStatic();
	init_NodeUseDualstackEndpointConfigOptions();
	init_NodeUseFipsEndpointConfigOptions();
	init_client$1();
	init_config$2();
	init_resolveRegionConfig();
	init_resolveDefaultsModeConfig();
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/adaptors/getEndpointUrlConfig.js
var ENV_ENDPOINT_URL, CONFIG_ENDPOINT_URL, getEndpointUrlConfig;
var init_getEndpointUrlConfig = __esmMin((() => {
	init_config$1();
	ENV_ENDPOINT_URL = "AWS_ENDPOINT_URL";
	CONFIG_ENDPOINT_URL = "endpoint_url";
	getEndpointUrlConfig = (serviceId) => ({
		environmentVariableSelector: (env) => {
			const serviceSuffixParts = serviceId.split(" ").map((w) => w.toUpperCase());
			const serviceEndpointUrl = env[[ENV_ENDPOINT_URL, ...serviceSuffixParts].join("_")];
			if (serviceEndpointUrl) return serviceEndpointUrl;
			const endpointUrl = env[ENV_ENDPOINT_URL];
			if (endpointUrl) return endpointUrl;
		},
		configFileSelector: (profile, config) => {
			if (profile.services) {
				const servicesSectionKey = ["services", profile.services].join(".");
				if (!config || !config[servicesSectionKey]) throw new Error(`The services section "${profile.services}" specified in the profile is not present in the shared configuration file.`);
				const endpointUrl = config[servicesSectionKey][[serviceId.split(" ").map((w) => w.toLowerCase()).join("_"), CONFIG_ENDPOINT_URL].join(".")];
				if (endpointUrl) return endpointUrl;
			}
			const endpointUrl = profile[CONFIG_ENDPOINT_URL];
			if (endpointUrl) return endpointUrl;
		},
		default: void 0
	});
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/adaptors/getIgnoreConfiguredEndpointUrls.js
var ENV_IGNORE_CONFIGURED_ENDPOINT_URLS, CONFIG_IGNORE_CONFIGURED_ENDPOINT_URLS, ignoreConfiguredEndpointUrlsConfigSelectors;
var init_getIgnoreConfiguredEndpointUrls = __esmMin((() => {
	init_config$1();
	ENV_IGNORE_CONFIGURED_ENDPOINT_URLS = "AWS_IGNORE_CONFIGURED_ENDPOINT_URLS";
	CONFIG_IGNORE_CONFIGURED_ENDPOINT_URLS = "ignore_configured_endpoint_urls";
	ignoreConfiguredEndpointUrlsConfigSelectors = {
		environmentVariableSelector: (env) => booleanSelector(env, ENV_IGNORE_CONFIGURED_ENDPOINT_URLS, SelectorType.ENV),
		configFileSelector: (profile) => booleanSelector(profile, CONFIG_IGNORE_CONFIGURED_ENDPOINT_URLS, SelectorType.CONFIG),
		default: false
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/adaptors/getEndpointFromConfig.js
var getEndpointFromConfig;
var init_getEndpointFromConfig = __esmMin((() => {
	init_config$1();
	init_getEndpointUrlConfig();
	init_getIgnoreConfiguredEndpointUrls();
	getEndpointFromConfig = async (serviceId) => {
		if (await loadConfig(ignoreConfiguredEndpointUrlsConfigSelectors)()) return;
		return loadConfig(getEndpointUrlConfig(serviceId ?? ""))();
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/service-customizations/s3.js
var resolveParamsForS3, DOMAIN_PATTERN, IP_ADDRESS_PATTERN, DOTS_PATTERN, isDnsCompatibleBucketName, isArnBucketName;
var init_s3 = __esmMin((() => {
	resolveParamsForS3 = async (endpointParams) => {
		const bucket = endpointParams?.Bucket || "";
		if (typeof endpointParams.Bucket === "string") endpointParams.Bucket = bucket.replace(/#/g, encodeURIComponent("#")).replace(/\?/g, encodeURIComponent("?"));
		if (isArnBucketName(bucket)) {
			if (endpointParams.ForcePathStyle === true) throw new Error("Path-style addressing cannot be used with ARN buckets");
		} else if (!isDnsCompatibleBucketName(bucket) || bucket.indexOf(".") !== -1 && !String(endpointParams.Endpoint).startsWith("http:") || bucket.toLowerCase() !== bucket || bucket.length < 3) endpointParams.ForcePathStyle = true;
		if (endpointParams.DisableMultiRegionAccessPoints) {
			endpointParams.disableMultiRegionAccessPoints = true;
			endpointParams.DisableMRAP = true;
		}
		return endpointParams;
	};
	DOMAIN_PATTERN = /^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/;
	IP_ADDRESS_PATTERN = /(\d+\.){3}\d+/;
	DOTS_PATTERN = /\.\./;
	isDnsCompatibleBucketName = (bucketName) => DOMAIN_PATTERN.test(bucketName) && !IP_ADDRESS_PATTERN.test(bucketName) && !DOTS_PATTERN.test(bucketName);
	isArnBucketName = (bucketName) => {
		const [arn, partition, service, , , bucket] = bucketName.split(":");
		const isArn = arn === "arn" && bucketName.split(":").length >= 6;
		const isValidArn = Boolean(isArn && partition && service && bucket);
		if (isArn && !isValidArn) throw new Error(`Invalid ARN: ${bucketName} was an invalid ARN.`);
		return isValidArn;
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/service-customizations/index.js
var init_service_customizations = __esmMin((() => {
	init_s3();
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/adaptors/createConfigValueProvider.js
var createConfigValueProvider;
var init_createConfigValueProvider = __esmMin((() => {
	createConfigValueProvider = (configKey, canonicalEndpointParamKey, config, isClientContextParam = false) => {
		const configProvider = async () => {
			let configValue;
			if (isClientContextParam) configValue = config.clientContextParams?.[configKey] ?? config[configKey] ?? config[canonicalEndpointParamKey];
			else configValue = config[configKey] ?? config[canonicalEndpointParamKey];
			if (typeof configValue === "function") return configValue();
			return configValue;
		};
		if (configKey === "credentialScope" || canonicalEndpointParamKey === "CredentialScope") return async () => {
			const credentials = typeof config.credentials === "function" ? await config.credentials() : config.credentials;
			return credentials?.credentialScope ?? credentials?.CredentialScope;
		};
		if (configKey === "accountId" || canonicalEndpointParamKey === "AccountId") return async () => {
			const credentials = typeof config.credentials === "function" ? await config.credentials() : config.credentials;
			return credentials?.accountId ?? credentials?.AccountId;
		};
		if (configKey === "endpoint" || canonicalEndpointParamKey === "endpoint") return async () => {
			if (config.isCustomEndpoint === false) return;
			const endpoint = await configProvider();
			if (endpoint && typeof endpoint === "object") {
				if ("url" in endpoint) return endpoint.url.href;
				if ("hostname" in endpoint) {
					const { protocol, hostname, port, path } = endpoint;
					return `${protocol}//${hostname}${port ? ":" + port : ""}${path}`;
				}
			}
			return endpoint;
		};
		return configProvider;
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/adaptors/toEndpointV1.js
var init_toEndpointV1 = __esmMin((() => {
	init_transport();
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/adaptors/getEndpointFromInstructions.js
function bindGetEndpointFromInstructions(getEndpointFromConfig) {
	return async (commandInput, instructionsSupplier, clientConfig, context) => {
		if (!clientConfig.isCustomEndpoint && !clientConfig.ignoreConfiguredEndpointUrls) {
			let endpointFromConfig;
			if (clientConfig.serviceConfiguredEndpoint) endpointFromConfig = await clientConfig.serviceConfiguredEndpoint();
			else endpointFromConfig = await getEndpointFromConfig(clientConfig.serviceId);
			if (endpointFromConfig) {
				clientConfig.endpoint = () => Promise.resolve(toEndpointV1(endpointFromConfig));
				clientConfig.isCustomEndpoint = true;
				context?.logger?.debug?.(`@smithy/core/endpoints - resolved endpoint from config: ${endpointFromConfig}`);
			}
		}
		const endpointParams = await resolveParams(commandInput, instructionsSupplier, clientConfig);
		if (typeof clientConfig.endpointProvider !== "function") throw new Error("config.endpointProvider is not set.");
		const endpoint = clientConfig.endpointProvider(endpointParams, context);
		if (clientConfig.isCustomEndpoint && clientConfig.endpoint) {
			const customEndpoint = await clientConfig.endpoint();
			if (customEndpoint?.headers) {
				endpoint.headers ??= {};
				for (const [name, value] of Object.entries(customEndpoint.headers)) endpoint.headers[name] = Array.isArray(value) ? value : [value];
			}
		}
		return endpoint;
	};
}
var resolveParams;
var init_getEndpointFromInstructions = __esmMin((() => {
	init_service_customizations();
	init_createConfigValueProvider();
	init_toEndpointV1();
	resolveParams = async (commandInput, instructionsSupplier, clientConfig) => {
		const endpointParams = {};
		const instructions = instructionsSupplier?.getEndpointParameterInstructions?.() || {};
		for (const [name, instruction] of Object.entries(instructions)) switch (instruction.type) {
			case "staticContextParams":
				endpointParams[name] = instruction.value;
				break;
			case "contextParams":
				endpointParams[name] = commandInput[instruction.name];
				break;
			case "clientContextParams":
			case "builtInParams":
				endpointParams[name] = await createConfigValueProvider(instruction.name, name, clientConfig, instruction.type !== "builtInParams")();
				break;
			case "operationContextParams":
				endpointParams[name] = instruction.get(commandInput);
				break;
			default: throw new Error("Unrecognized endpoint parameter instruction: " + JSON.stringify(instruction));
		}
		if (Object.keys(instructions).length === 0) Object.assign(endpointParams, clientConfig);
		if (String(clientConfig.serviceId).toLowerCase() === "s3") await resolveParamsForS3(endpointParams);
		return endpointParams;
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/endpointMiddleware.js
function setFeature$1(context, feature, value) {
	if (!context.__smithy_context) context.__smithy_context = { features: {} };
	else if (!context.__smithy_context.features) context.__smithy_context.features = {};
	context.__smithy_context.features[feature] = value;
}
function bindEndpointMiddleware(getEndpointFromConfig) {
	const getEndpointFromInstructions = bindGetEndpointFromInstructions(getEndpointFromConfig);
	return ({ config, instructions }) => {
		return (next, context) => async (args) => {
			if (config.isCustomEndpoint) setFeature$1(context, "ENDPOINT_OVERRIDE", "N");
			const endpoint = await getEndpointFromInstructions(args.input, { getEndpointParameterInstructions() {
				return instructions;
			} }, { ...config }, context);
			context.endpointV2 = endpoint;
			context.authSchemes = endpoint.properties?.authSchemes;
			const authScheme = context.authSchemes?.[0];
			if (authScheme) {
				context["signing_region"] = authScheme.signingRegion;
				context["signing_service"] = authScheme.signingName;
				const httpAuthOption = getSmithyContext(context)?.selectedHttpAuthScheme?.httpAuthOption;
				if (httpAuthOption) httpAuthOption.signingProperties = Object.assign(httpAuthOption.signingProperties || {}, {
					signing_region: authScheme.signingRegion,
					signingRegion: authScheme.signingRegion,
					signing_service: authScheme.signingName,
					signingName: authScheme.signingName,
					signingRegionSet: authScheme.signingRegionSet
				}, authScheme.properties);
			}
			return next({ ...args });
		};
	};
}
var init_endpointMiddleware = __esmMin((() => {
	init_transport();
	init_getEndpointFromInstructions();
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/getEndpointPlugin.js
function bindGetEndpointPlugin(getEndpointFromConfig) {
	const endpointMiddleware = bindEndpointMiddleware(getEndpointFromConfig);
	return (config, instructions) => ({ applyToStack: (clientStack) => {
		clientStack.addRelativeTo(endpointMiddleware({
			config,
			instructions
		}), endpointMiddlewareOptions);
	} });
}
var serializerMiddlewareOption, endpointMiddlewareOptions;
var init_getEndpointPlugin = __esmMin((() => {
	init_endpointMiddleware();
	serializerMiddlewareOption = {
		name: "serializerMiddleware",
		step: "serialize",
		tags: ["SERIALIZER"],
		override: true
	};
	endpointMiddlewareOptions = {
		step: "serialize",
		tags: [
			"ENDPOINT_PARAMETERS",
			"ENDPOINT_V2",
			"ENDPOINT"
		],
		name: "endpointV2Middleware",
		override: true,
		relation: "before",
		toMiddleware: serializerMiddlewareOption.name
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/resolveEndpointConfig.js
function bindResolveEndpointConfig(getEndpointFromConfig) {
	return (input) => {
		const tls = input.tls ?? true;
		const { endpoint, useDualstackEndpoint, useFipsEndpoint } = input;
		const resolvedConfig = Object.assign(input, {
			endpoint: endpoint != null ? async () => toEndpointV1(await normalizeProvider$1(endpoint)()) : void 0,
			tls,
			isCustomEndpoint: !!endpoint,
			useDualstackEndpoint: normalizeProvider$1(useDualstackEndpoint ?? false),
			useFipsEndpoint: normalizeProvider$1(useFipsEndpoint ?? false),
			ignoreConfiguredEndpointUrls: !!input.ignoreConfiguredEndpointUrls
		});
		let configuredEndpointPromise = void 0;
		resolvedConfig.serviceConfiguredEndpoint = async () => {
			if (input.serviceId && !configuredEndpointPromise) configuredEndpointPromise = getEndpointFromConfig(input.serviceId);
			return configuredEndpointPromise;
		};
		return resolvedConfig;
	};
}
var init_resolveEndpointConfig = __esmMin((() => {
	init_transport();
	init_toEndpointV1();
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/bdd/BinaryDecisionDiagram.js
var BinaryDecisionDiagram;
var init_BinaryDecisionDiagram = __esmMin((() => {
	BinaryDecisionDiagram = class BinaryDecisionDiagram {
		nodes;
		root;
		conditions;
		results;
		constructor(bdd, root, conditions, results) {
			this.nodes = bdd;
			this.root = root;
			this.conditions = conditions;
			this.results = results;
		}
		static from(bdd, root, conditions, results) {
			return new BinaryDecisionDiagram(bdd, root, conditions, results);
		}
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/cache/EndpointCache.js
var EndpointCache;
var init_EndpointCache = __esmMin((() => {
	EndpointCache = class {
		capacity;
		data = /* @__PURE__ */ new Map();
		parameters = [];
		constructor({ size, params }) {
			this.capacity = size ?? 50;
			if (params) this.parameters = params;
		}
		get(endpointParams, resolver) {
			const key = this.hash(endpointParams);
			if (key === false) return resolver();
			if (!this.data.has(key)) {
				if (this.data.size > this.capacity + 10) {
					const keys = this.data.keys();
					let i = 0;
					while (true) {
						const { value, done } = keys.next();
						this.data.delete(value);
						if (done || ++i > 10) break;
					}
				}
				this.data.set(key, resolver());
			}
			return this.data.get(key);
		}
		size() {
			return this.data.size;
		}
		hash(endpointParams) {
			let buffer = "";
			const { parameters } = this;
			if (parameters.length === 0) return false;
			for (const param of parameters) {
				const val = String(endpointParams[param] ?? "");
				if (val.includes("|;")) return false;
				buffer += val + "|;";
			}
			return buffer;
		}
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/types/EndpointError.js
var EndpointError;
var init_EndpointError = __esmMin((() => {
	EndpointError = class extends Error {
		constructor(message) {
			super(message);
			this.name = "EndpointError";
		}
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/types/index.js
var init_types = __esmMin((() => {
	init_EndpointError();
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/debug/debugId.js
var debugId;
var init_debugId = __esmMin((() => {
	debugId = "endpoints";
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/debug/toDebugString.js
function toDebugString(input) {
	if (typeof input !== "object" || input == null) return input;
	if ("ref" in input) return `$${toDebugString(input.ref)}`;
	if ("fn" in input) return `${input.fn}(${(input.argv || []).map(toDebugString).join(", ")})`;
	return JSON.stringify(input, null, 2);
}
var init_toDebugString = __esmMin((() => {}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/debug/index.js
var init_debug = __esmMin((() => {
	init_debugId();
	init_toDebugString();
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/utils/customEndpointFunctions.js
var customEndpointFunctions;
var init_customEndpointFunctions = __esmMin((() => {
	customEndpointFunctions = {};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/lib/booleanEquals.js
var booleanEquals;
var init_booleanEquals = __esmMin((() => {
	booleanEquals = (value1, value2) => value1 === value2;
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/lib/coalesce.js
function coalesce(...args) {
	for (const arg of args) if (arg != null) return arg;
}
var init_coalesce = __esmMin((() => {}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/lib/getAttrPathList.js
var getAttrPathList;
var init_getAttrPathList = __esmMin((() => {
	init_types();
	getAttrPathList = (path) => {
		const parts = path.split(".");
		const pathList = [];
		for (const part of parts) {
			const squareBracketIndex = part.indexOf("[");
			if (squareBracketIndex !== -1) {
				if (part.indexOf("]") !== part.length - 1) throw new EndpointError(`Path: '${path}' does not end with ']'`);
				const arrayIndex = part.slice(squareBracketIndex + 1, -1);
				if (Number.isNaN(parseInt(arrayIndex))) throw new EndpointError(`Invalid array index: '${arrayIndex}' in path: '${path}'`);
				if (squareBracketIndex !== 0) pathList.push(part.slice(0, squareBracketIndex));
				pathList.push(arrayIndex);
			} else pathList.push(part);
		}
		return pathList;
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/lib/getAttr.js
var getAttr;
var init_getAttr = __esmMin((() => {
	init_types();
	init_getAttrPathList();
	getAttr = (value, path) => getAttrPathList(path).reduce((acc, index) => {
		if (typeof acc !== "object") throw new EndpointError(`Index '${index}' in '${path}' not found in '${JSON.stringify(value)}'`);
		else if (Array.isArray(acc)) {
			const i = parseInt(index);
			return acc[i < 0 ? acc.length + i : i];
		}
		return acc[index];
	}, value);
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/lib/isSet.js
var isSet;
var init_isSet = __esmMin((() => {
	isSet = (value) => value != null;
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/lib/ite.js
function ite(condition, trueValue, falseValue) {
	return condition ? trueValue : falseValue;
}
var init_ite = __esmMin((() => {}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/lib/not.js
var not;
var init_not = __esmMin((() => {
	not = (value) => !value;
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/lib/isIpAddress.js
var IP_V4_REGEX, isIpAddress;
var init_isIpAddress$1 = __esmMin((() => {
	IP_V4_REGEX = new RegExp(`^(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)){3}$`);
	isIpAddress = (value) => IP_V4_REGEX.test(value) || value.startsWith("[") && value.endsWith("]");
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/lib/parseURL.js
var DEFAULT_PORTS, parseURL;
var init_parseURL = __esmMin((() => {
	init_dist_es$14();
	init_isIpAddress$1();
	DEFAULT_PORTS = {
		[EndpointURLScheme.HTTP]: 80,
		[EndpointURLScheme.HTTPS]: 443
	};
	parseURL = (value) => {
		const whatwgURL = (() => {
			try {
				if (value instanceof URL) return value;
				if (typeof value === "object" && "hostname" in value) {
					const { hostname, port, protocol = "", path = "", query = {} } = value;
					const url = new URL(`${protocol}//${hostname}${port ? `:${port}` : ""}${path}`);
					url.search = Object.entries(query).map(([k, v]) => `${k}=${v}`).join("&");
					return url;
				}
				return new URL(value);
			} catch (ignored) {
				return null;
			}
		})();
		if (!whatwgURL) {
			console.error(`Unable to parse ${JSON.stringify(value)} as a whatwg URL.`);
			return null;
		}
		const urlString = whatwgURL.href;
		const { host, hostname, pathname, protocol, search } = whatwgURL;
		if (search) return null;
		const scheme = protocol.slice(0, -1);
		if (!Object.values(EndpointURLScheme).includes(scheme)) return null;
		const isIp = isIpAddress(hostname);
		return {
			scheme,
			authority: `${host}${urlString.includes(`${host}:${DEFAULT_PORTS[scheme]}`) || typeof value === "string" && value.includes(`${host}:${DEFAULT_PORTS[scheme]}`) ? `:${DEFAULT_PORTS[scheme]}` : ``}`,
			path: pathname,
			normalizedPath: pathname.endsWith("/") ? pathname : `${pathname}/`,
			isIp
		};
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/lib/split.js
function split(value, delimiter, limit) {
	if (limit === 1) return [value];
	if (value === "") return [""];
	const parts = value.split(delimiter);
	if (limit === 0) return parts;
	return parts.slice(0, limit - 1).concat(parts.slice(1).join(delimiter));
}
var init_split = __esmMin((() => {}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/lib/stringEquals.js
var stringEquals;
var init_stringEquals = __esmMin((() => {
	stringEquals = (value1, value2) => value1 === value2;
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/lib/substring.js
var substring;
var init_substring = __esmMin((() => {
	substring = (input, start, stop, reverse) => {
		if (input == null || start >= stop || input.length < stop || /[^\u0000-\u007f]/.test(input)) return null;
		if (!reverse) return input.substring(start, stop);
		return input.substring(input.length - stop, input.length - start);
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/lib/uriEncode.js
var uriEncode;
var init_uriEncode = __esmMin((() => {
	uriEncode = (value) => encodeURIComponent(value).replace(/[!*'()]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/lib/index.js
var init_lib = __esmMin((() => {
	init_booleanEquals();
	init_coalesce();
	init_getAttr();
	init_isSet();
	init_transport();
	init_ite();
	init_not();
	init_parseURL();
	init_split();
	init_stringEquals();
	init_substring();
	init_uriEncode();
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/utils/endpointFunctions.js
var endpointFunctions;
var init_endpointFunctions = __esmMin((() => {
	init_lib();
	endpointFunctions = {
		booleanEquals,
		coalesce,
		getAttr,
		isSet,
		isValidHostLabel,
		ite,
		not,
		parseURL,
		split,
		stringEquals,
		substring,
		uriEncode
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/utils/evaluateTemplate.js
var evaluateTemplate;
var init_evaluateTemplate = __esmMin((() => {
	init_lib();
	evaluateTemplate = (template, options) => {
		const evaluatedTemplateArr = [];
		const { referenceRecord, endpointParams } = options;
		let currentIndex = 0;
		while (currentIndex < template.length) {
			const openingBraceIndex = template.indexOf("{", currentIndex);
			if (openingBraceIndex === -1) {
				evaluatedTemplateArr.push(template.slice(currentIndex));
				break;
			}
			evaluatedTemplateArr.push(template.slice(currentIndex, openingBraceIndex));
			const closingBraceIndex = template.indexOf("}", openingBraceIndex);
			if (closingBraceIndex === -1) {
				evaluatedTemplateArr.push(template.slice(openingBraceIndex));
				break;
			}
			if (template[openingBraceIndex + 1] === "{" && template[closingBraceIndex + 1] === "}") {
				evaluatedTemplateArr.push(template.slice(openingBraceIndex + 1, closingBraceIndex));
				currentIndex = closingBraceIndex + 2;
			}
			const parameterName = template.substring(openingBraceIndex + 1, closingBraceIndex);
			if (parameterName.includes("#")) {
				const [refName, attrName] = parameterName.split("#");
				evaluatedTemplateArr.push(getAttr(referenceRecord[refName] ?? endpointParams[refName], attrName));
			} else evaluatedTemplateArr.push(referenceRecord[parameterName] ?? endpointParams[parameterName]);
			currentIndex = closingBraceIndex + 1;
		}
		return evaluatedTemplateArr.join("");
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/utils/getReferenceValue.js
var getReferenceValue;
var init_getReferenceValue = __esmMin((() => {
	getReferenceValue = ({ ref }, options) => {
		return options.referenceRecord[ref] ?? options.endpointParams[ref];
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/utils/evaluateExpression.js
var evaluateExpression, callFunction, group$1;
var init_evaluateExpression = __esmMin((() => {
	init_types();
	init_customEndpointFunctions();
	init_endpointFunctions();
	init_evaluateTemplate();
	init_getReferenceValue();
	evaluateExpression = (obj, keyName, options) => {
		if (typeof obj === "string") return evaluateTemplate(obj, options);
		else if (obj["fn"]) return group$1.callFunction(obj, options);
		else if (obj["ref"]) return getReferenceValue(obj, options);
		throw new EndpointError(`'${keyName}': ${String(obj)} is not a string, function or reference.`);
	};
	callFunction = ({ fn, argv }, options) => {
		const evaluatedArgs = Array(argv.length);
		for (let i = 0; i < evaluatedArgs.length; ++i) {
			const arg = argv[i];
			if (typeof arg === "boolean" || typeof arg === "number") evaluatedArgs[i] = arg;
			else evaluatedArgs[i] = group$1.evaluateExpression(arg, "arg", options);
		}
		const namespaceSeparatorIndex = fn.indexOf(".");
		if (namespaceSeparatorIndex !== -1) {
			const customFunction = customEndpointFunctions[fn.slice(0, namespaceSeparatorIndex)]?.[fn.slice(namespaceSeparatorIndex + 1)];
			if (typeof customFunction === "function") return customFunction(...evaluatedArgs);
		}
		const callable = endpointFunctions[fn];
		if (typeof callable === "function") return callable(...evaluatedArgs);
		throw new Error(`function ${fn} not loaded in endpointFunctions.`);
	};
	group$1 = {
		evaluateExpression,
		callFunction
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/utils/callFunction.js
var init_callFunction = __esmMin((() => {
	init_evaluateExpression();
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/utils/evaluateCondition.js
var evaluateCondition;
var init_evaluateCondition = __esmMin((() => {
	init_debug();
	init_types();
	init_callFunction();
	evaluateCondition = (condition, options) => {
		const { assign } = condition;
		if (assign && assign in options.referenceRecord) throw new EndpointError(`'${assign}' is already defined in Reference Record.`);
		const value = callFunction(condition, options);
		options.logger?.debug?.(`${debugId} evaluateCondition: ${toDebugString(condition)} = ${toDebugString(value)}`);
		const result = value === "" ? true : !!value;
		if (assign != null) return {
			result,
			toAssign: {
				name: assign,
				value
			}
		};
		return { result };
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/utils/getEndpointHeaders.js
var getEndpointHeaders;
var init_getEndpointHeaders = __esmMin((() => {
	init_types();
	init_evaluateExpression();
	getEndpointHeaders = (headers, options) => Object.entries(headers ?? {}).reduce((acc, [headerKey, headerVal]) => {
		acc[headerKey] = headerVal.map((headerValEntry) => {
			const processedExpr = evaluateExpression(headerValEntry, "Header value entry", options);
			if (typeof processedExpr !== "string") throw new EndpointError(`Header '${headerKey}' value '${processedExpr}' is not a string`);
			return processedExpr;
		});
		return acc;
	}, {});
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/utils/getEndpointProperties.js
var getEndpointProperties, getEndpointProperty, group;
var init_getEndpointProperties = __esmMin((() => {
	init_types();
	init_evaluateTemplate();
	getEndpointProperties = (properties, options) => Object.entries(properties).reduce((acc, [propertyKey, propertyVal]) => {
		acc[propertyKey] = group.getEndpointProperty(propertyVal, options);
		return acc;
	}, {});
	getEndpointProperty = (property, options) => {
		if (Array.isArray(property)) return property.map((propertyEntry) => getEndpointProperty(propertyEntry, options));
		switch (typeof property) {
			case "string": return evaluateTemplate(property, options);
			case "object":
				if (property === null) throw new EndpointError(`Unexpected endpoint property: ${property}`);
				return group.getEndpointProperties(property, options);
			case "boolean": return property;
			default: throw new EndpointError(`Unexpected endpoint property type: ${typeof property}`);
		}
	};
	group = {
		getEndpointProperty,
		getEndpointProperties
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/utils/getEndpointUrl.js
var getEndpointUrl;
var init_getEndpointUrl = __esmMin((() => {
	init_types();
	init_evaluateExpression();
	getEndpointUrl = (endpointUrl, options) => {
		const expression = evaluateExpression(endpointUrl, "Endpoint URL", options);
		if (typeof expression === "string") try {
			return new URL(expression);
		} catch (error) {
			console.error(`Failed to construct URL with ${expression}`, error);
			throw error;
		}
		throw new EndpointError(`Endpoint URL must be a string, got ${typeof expression}`);
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/decideEndpoint.js
var RESULT, decideEndpoint;
var init_decideEndpoint = __esmMin((() => {
	init_types();
	init_evaluateCondition();
	init_evaluateExpression();
	init_getEndpointHeaders();
	init_getEndpointProperties();
	init_getEndpointUrl();
	RESULT = 1e8;
	decideEndpoint = (bdd, options) => {
		const { nodes, root, results, conditions } = bdd;
		let ref = root;
		const referenceRecord = {};
		const closure = {
			referenceRecord,
			endpointParams: options.endpointParams,
			logger: options.logger
		};
		while (ref !== 1 && ref !== -1 && ref < RESULT) {
			const node_i = 3 * (Math.abs(ref) - 1);
			const [condition_i, highRef, lowRef] = [
				nodes[node_i],
				nodes[node_i + 1],
				nodes[node_i + 2]
			];
			const [fn, argv, assign] = conditions[condition_i];
			const evaluation = evaluateCondition({
				fn,
				assign,
				argv
			}, closure);
			if (evaluation.toAssign) {
				const { name, value } = evaluation.toAssign;
				referenceRecord[name] = value;
			}
			ref = ref >= 0 === evaluation.result ? highRef : lowRef;
		}
		if (ref >= RESULT) {
			const result = results[ref - RESULT];
			if (result[0] === -1) {
				const [, errorExpression] = result;
				throw new EndpointError(evaluateExpression(errorExpression, "Error", closure));
			}
			const [url, properties, headers] = result;
			return {
				url: getEndpointUrl(url, closure),
				properties: getEndpointProperties(properties, closure),
				headers: getEndpointHeaders(headers ?? {}, closure)
			};
		}
		throw new EndpointError(`No matching endpoint.`);
	};
})), resolveEndpointConfig, getEndpointPlugin;
var init_endpoints = __esmMin((() => {
	init_getEndpointFromConfig();
	init_getEndpointFromInstructions();
	init_endpointMiddleware();
	init_getEndpointPlugin();
	init_resolveEndpointConfig();
	init_transport();
	init_BinaryDecisionDiagram();
	init_EndpointCache();
	init_decideEndpoint();
	init_isIpAddress$1();
	init_customEndpointFunctions();
	init_debug();
	init_types();
	init_evaluateCondition();
	init_getEndpointHeaders();
	init_getEndpointProperties();
	init_getEndpointUrl();
	init_evaluateExpression();
	init_toEndpointV1();
	resolveEndpointConfig = bindResolveEndpointConfig(getEndpointFromConfig);
	bindEndpointMiddleware(getEndpointFromConfig);
	getEndpointPlugin = bindGetEndpointPlugin(getEndpointFromConfig);
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/serde/util-stream/checksum/ChecksumStream.js
var ChecksumStream$1;
var init_ChecksumStream = __esmMin((() => {
	init_toBase64();
	ChecksumStream$1 = class extends Readable {
		expectedChecksum;
		checksumSourceLocation;
		checksum;
		source;
		base64Encoder;
		constructor({ expectedChecksum, checksum, source, checksumSourceLocation, base64Encoder }) {
			super();
			if (typeof source.pipe !== "function") throw new Error(`@smithy/util-stream: unsupported source type ${source?.constructor?.name ?? source} in ChecksumStream.`);
			this.source = source;
			this.base64Encoder = base64Encoder ?? toBase64$1;
			this.expectedChecksum = expectedChecksum;
			this.checksum = checksum;
			this.checksumSourceLocation = checksumSourceLocation;
			this.source.on("data", this.onSourceData);
			this.source.on("end", this.onSourceEnd);
			this.source.on("error", this.onSourceError);
			this.source.on("close", this.onSourceClose);
			this.source.pause();
		}
		onSourceData = (chunk) => {
			if (this.destroyed) return;
			try {
				this.checksum.update(chunk);
			} catch (e) {
				this.destroy(e);
				return;
			}
			if (!this.push(chunk)) this.source.pause();
		};
		onSourceEnd = async () => {
			if (this.destroyed) return;
			try {
				const digest = await this.checksum.digest();
				const received = this.base64Encoder(digest);
				if (this.expectedChecksum !== received) {
					this.destroy(/* @__PURE__ */ new Error(`Checksum mismatch: expected "${this.expectedChecksum}" but received "${received}" in response header "${this.checksumSourceLocation}".`));
					return;
				}
			} catch (e) {
				this.destroy(e);
				return;
			}
			this.push(null);
		};
		onSourceError = (error) => {
			this.destroy(error);
		};
		onSourceClose = () => {
			if (!this.destroyed && !this.source.readableEnded) this.destroy(/* @__PURE__ */ new Error("Connection lost or stream closed before all data was received."));
		};
		_read(_size) {
			this.source.resume();
		}
		_destroy(error, callback) {
			this.source?.removeListener("data", this.onSourceData);
			this.source?.removeListener("end", this.onSourceEnd);
			this.source?.removeListener("error", this.onSourceError);
			this.source?.removeListener("close", this.onSourceClose);
			this.source?.destroy();
			callback(error);
		}
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/serde/util-stream/stream-type-check.js
var isReadableStream, isBlob;
var init_stream_type_check = __esmMin((() => {
	isReadableStream = (stream) => typeof ReadableStream === "function" && (stream?.constructor?.name === ReadableStream.name || stream instanceof ReadableStream);
	isBlob = (blob) => {
		return typeof Blob === "function" && (blob?.constructor?.name === Blob.name || blob instanceof Blob);
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/serde/util-utf8/fromUtf8.browser.js
var fromUtf8;
var init_fromUtf8_browser = __esmMin((() => {
	fromUtf8 = (input) => new TextEncoder().encode(input);
})), chars, alphabetByValue;
var init_constants_for_browser = __esmMin((() => {
	chars = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/`;
	Object.entries(chars).reduce((acc, [i, c]) => {
		acc[c] = Number(i);
		return acc;
	}, {});
	alphabetByValue = chars.split("");
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/serde/util-base64/toBase64.browser.js
function toBase64(_input) {
	let input;
	if (typeof _input === "string") input = fromUtf8(_input);
	else input = _input;
	const isArrayLike = typeof input === "object" && typeof input.length === "number";
	const isUint8Array = typeof input === "object" && typeof input.byteOffset === "number" && typeof input.byteLength === "number";
	if (!isArrayLike && !isUint8Array) throw new Error("@smithy/util-base64: toBase64 encoder function only accepts string | Uint8Array.");
	let str = "";
	for (let i = 0; i < input.length; i += 3) {
		let bits = 0;
		let bitLength = 0;
		for (let j = i, limit = Math.min(i + 3, input.length); j < limit; j++) {
			bits |= input[j] << (limit - j - 1) * 8;
			bitLength += 8;
		}
		const bitClusterCount = Math.ceil(bitLength / 6);
		bits <<= bitClusterCount * 6 - bitLength;
		for (let k = 1; k <= bitClusterCount; k++) {
			const offset = (bitClusterCount - k) * 6;
			str += alphabetByValue[(bits & 63 << offset) >> offset];
		}
		str += "==".slice(0, 4 - bitClusterCount);
	}
	return str;
}
var init_toBase64_browser = __esmMin((() => {
	init_fromUtf8_browser();
	init_constants_for_browser();
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/serde/util-stream/checksum/ChecksumStream.browser.js
var ReadableStreamRef, ChecksumStream;
var init_ChecksumStream_browser = __esmMin((() => {
	ReadableStreamRef = typeof ReadableStream === "function" ? ReadableStream : function() {};
	ChecksumStream = class extends ReadableStreamRef {};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/serde/util-stream/checksum/createChecksumStream.browser.js
var createChecksumStream$1;
var init_createChecksumStream_browser = __esmMin((() => {
	init_toBase64_browser();
	init_stream_type_check();
	init_ChecksumStream_browser();
	createChecksumStream$1 = ({ expectedChecksum, checksum, source, checksumSourceLocation, base64Encoder }) => {
		if (!isReadableStream(source)) throw new Error(`@smithy/util-stream: unsupported source type ${source?.constructor?.name ?? source} in ChecksumStream.`);
		const encoder = base64Encoder ?? toBase64;
		if (typeof TransformStream !== "function") throw new Error("@smithy/util-stream: unable to instantiate ChecksumStream because API unavailable: ReadableStream/TransformStream.");
		const transform = new TransformStream({
			start() {},
			async transform(chunk, controller) {
				checksum.update(chunk);
				controller.enqueue(chunk);
			},
			async flush(controller) {
				const digest = await checksum.digest();
				const received = encoder(digest);
				if (expectedChecksum !== received) {
					const error = /* @__PURE__ */ new Error(`Checksum mismatch: expected "${expectedChecksum}" but received "${received}" in response header "${checksumSourceLocation}".`);
					controller.error(error);
				} else controller.terminate();
			}
		});
		source.pipeThrough(transform);
		const readable = transform.readable;
		Object.setPrototypeOf(readable, ChecksumStream.prototype);
		return readable;
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/serde/util-stream/checksum/createChecksumStream.js
function createChecksumStream(init) {
	if (typeof ReadableStream === "function" && isReadableStream(init.source)) return createChecksumStream$1(init);
	return new ChecksumStream$1(init);
}
var init_createChecksumStream = __esmMin((() => {
	init_stream_type_check();
	init_ChecksumStream();
	init_createChecksumStream_browser();
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/serde/util-stream/ByteArrayCollector.js
var ByteArrayCollector;
var init_ByteArrayCollector = __esmMin((() => {
	ByteArrayCollector = class {
		allocByteArray;
		byteLength = 0;
		byteArrays = [];
		constructor(allocByteArray) {
			this.allocByteArray = allocByteArray;
		}
		push(byteArray) {
			this.byteArrays.push(byteArray);
			this.byteLength += byteArray.byteLength;
		}
		flush() {
			if (this.byteArrays.length === 1) {
				const bytes = this.byteArrays[0];
				this.reset();
				return bytes;
			}
			const aggregation = this.allocByteArray(this.byteLength);
			let cursor = 0;
			for (let i = 0; i < this.byteArrays.length; ++i) {
				const bytes = this.byteArrays[i];
				aggregation.set(bytes, cursor);
				cursor += bytes.byteLength;
			}
			this.reset();
			return aggregation;
		}
		reset() {
			this.byteArrays = [];
			this.byteLength = 0;
		}
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/serde/util-stream/createBufferedReadable.browser.js
function createBufferedReadableStream(upstream, size, logger) {
	const reader = upstream.getReader();
	let streamBufferingLoggedWarning = false;
	let bytesSeen = 0;
	const buffers = ["", new ByteArrayCollector((size) => new Uint8Array(size))];
	let mode = -1;
	const pull = async (controller) => {
		const { value, done } = await reader.read();
		const chunk = value;
		if (done) {
			if (mode !== -1) {
				const remainder = flush(buffers, mode);
				if (sizeOf(remainder) > 0) controller.enqueue(remainder);
			}
			controller.close();
		} else {
			const chunkMode = modeOf(chunk, false);
			if (mode !== chunkMode) {
				if (mode >= 0) controller.enqueue(flush(buffers, mode));
				mode = chunkMode;
			}
			if (mode === -1) {
				controller.enqueue(chunk);
				return;
			}
			const chunkSize = sizeOf(chunk);
			bytesSeen += chunkSize;
			const bufferSize = sizeOf(buffers[mode]);
			if (chunkSize >= size && bufferSize === 0) controller.enqueue(chunk);
			else {
				const newSize = merge(buffers, mode, chunk);
				if (!streamBufferingLoggedWarning && bytesSeen > size * 2) {
					streamBufferingLoggedWarning = true;
					logger?.warn(`@smithy/util-stream - stream chunk size ${chunkSize} is below threshold of ${size}, automatically buffering.`);
				}
				if (newSize >= size) controller.enqueue(flush(buffers, mode));
				else await pull(controller);
			}
		}
	};
	return new ReadableStream({ pull });
}
function merge(buffers, mode, chunk) {
	switch (mode) {
		case 0:
			buffers[0] += chunk;
			return sizeOf(buffers[0]);
		case 1:
		case 2:
			buffers[mode].push(chunk);
			return sizeOf(buffers[mode]);
	}
}
function flush(buffers, mode) {
	switch (mode) {
		case 0:
			const s = buffers[0];
			buffers[0] = "";
			return s;
		case 1:
		case 2: return buffers[mode].flush();
	}
	throw new Error(`@smithy/util-stream - invalid index ${mode} given to flush()`);
}
function sizeOf(chunk) {
	return chunk?.byteLength ?? chunk?.length ?? 0;
}
function modeOf(chunk, allowBuffer = true) {
	if (allowBuffer && typeof Buffer !== "undefined" && chunk instanceof Buffer) return 2;
	if (chunk instanceof Uint8Array) return 1;
	if (typeof chunk === "string") return 0;
	return -1;
}
var init_createBufferedReadable_browser = __esmMin((() => {
	init_ByteArrayCollector();
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/serde/util-stream/createBufferedReadable.js
function createBufferedReadable(upstream, size, logger) {
	if (isReadableStream(upstream)) return createBufferedReadableStream(upstream, size, logger);
	const downstream = new Readable({ read() {} });
	let streamBufferingLoggedWarning = false;
	let bytesSeen = 0;
	const buffers = [
		"",
		new ByteArrayCollector((size) => new Uint8Array(size)),
		new ByteArrayCollector((size) => Buffer.from(new Uint8Array(size)))
	];
	let mode = -1;
	upstream.on("data", (chunk) => {
		const chunkMode = modeOf(chunk, true);
		if (mode !== chunkMode) {
			if (mode >= 0) downstream.push(flush(buffers, mode));
			mode = chunkMode;
		}
		if (mode === -1) {
			downstream.push(chunk);
			return;
		}
		const chunkSize = sizeOf(chunk);
		bytesSeen += chunkSize;
		const bufferSize = sizeOf(buffers[mode]);
		if (chunkSize >= size && bufferSize === 0) downstream.push(chunk);
		else {
			const newSize = merge(buffers, mode, chunk);
			if (!streamBufferingLoggedWarning && bytesSeen > size * 2) {
				streamBufferingLoggedWarning = true;
				logger?.warn(`@smithy/util-stream - stream chunk size ${chunkSize} is below threshold of ${size}, automatically buffering.`);
			}
			if (newSize >= size) downstream.push(flush(buffers, mode));
		}
	});
	upstream.on("end", () => {
		if (mode !== -1) {
			const remainder = flush(buffers, mode);
			if (sizeOf(remainder) > 0) downstream.push(remainder);
		}
		downstream.push(null);
	});
	return downstream;
}
var init_createBufferedReadable = __esmMin((() => {
	init_ByteArrayCollector();
	init_createBufferedReadable_browser();
	init_stream_type_check();
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/serde/util-stream/getAwsChunkedEncodingStream.browser.js
var getAwsChunkedEncodingStream$1;
var init_getAwsChunkedEncodingStream_browser = __esmMin((() => {
	getAwsChunkedEncodingStream$1 = (readableStream, options) => {
		const { base64Encoder, bodyLengthChecker, checksumAlgorithmFn, checksumLocationName, streamHasher } = options;
		const checksumRequired = base64Encoder !== void 0 && bodyLengthChecker !== void 0 && checksumAlgorithmFn !== void 0 && checksumLocationName !== void 0 && streamHasher !== void 0;
		const digest = checksumRequired ? streamHasher(checksumAlgorithmFn, readableStream) : void 0;
		Promise.resolve(digest).catch(() => {});
		const reader = readableStream.getReader();
		return new ReadableStream({ async pull(controller) {
			const { value, done } = await reader.read();
			if (done) {
				controller.enqueue(`0\r\n`);
				if (checksumRequired) {
					const checksum = base64Encoder(await digest);
					controller.enqueue(`${checksumLocationName}:${checksum}\r\n`);
					controller.enqueue(`\r\n`);
				}
				controller.close();
			} else controller.enqueue(`${(bodyLengthChecker(value) || 0).toString(16)}\r\n${value}\r\n`);
		} });
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/serde/util-stream/getAwsChunkedEncodingStream.js
function getAwsChunkedEncodingStream(stream, options) {
	const readable = stream;
	const readableStream = stream;
	if (isReadableStream(readableStream)) return getAwsChunkedEncodingStream$1(readableStream, options);
	const { base64Encoder, bodyLengthChecker, checksumAlgorithmFn, checksumLocationName, streamHasher } = options;
	const checksumRequired = base64Encoder !== void 0 && checksumAlgorithmFn !== void 0 && checksumLocationName !== void 0 && streamHasher !== void 0;
	const digest = checksumRequired ? streamHasher(checksumAlgorithmFn, readable) : void 0;
	Promise.resolve(digest).catch(() => {});
	const awsChunkedEncodingStream = new Readable({ read() {
		readable.resume();
	} });
	readable.on("data", (data) => {
		const length = bodyLengthChecker(data) || 0;
		if (length === 0) return;
		awsChunkedEncodingStream.push(`${length.toString(16)}\r\n`);
		awsChunkedEncodingStream.push(data);
		if (!awsChunkedEncodingStream.push("\r\n")) readable.pause();
	});
	readable.on("error", (err) => {
		awsChunkedEncodingStream.destroy(err);
	});
	readable.pause();
	readable.on("end", async () => {
		try {
			awsChunkedEncodingStream.push(`0\r\n`);
			if (checksumRequired) {
				const checksum = base64Encoder(await digest);
				awsChunkedEncodingStream.push(`${checksumLocationName}:${checksum}\r\n`);
				awsChunkedEncodingStream.push(`\r\n`);
			}
			awsChunkedEncodingStream.push(null);
		} catch (err) {
			awsChunkedEncodingStream.destroy(err);
		}
	});
	return awsChunkedEncodingStream;
}
var init_getAwsChunkedEncodingStream = __esmMin((() => {
	init_getAwsChunkedEncodingStream_browser();
	init_stream_type_check();
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/serde/util-utf8/toUtf8.browser.js
var toUtf8;
var init_toUtf8_browser = __esmMin((() => {
	toUtf8 = (input) => {
		if (typeof input === "string") return input;
		if (typeof input !== "object" || typeof input.byteOffset !== "number" || typeof input.byteLength !== "number") throw new Error("@smithy/util-utf8: toUtf8 encoder function only accepts string | Uint8Array.");
		return new TextDecoder("utf-8").decode(input);
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/serde/util-stream/stream-collector.browser.js
async function collectBlob(blob) {
	return blob.arrayBuffer().then((ab) => new Uint8Array(ab));
}
async function collectReadableStream(stream) {
	const chunks = [];
	const reader = stream.getReader();
	let length = 0;
	while (true) {
		const { done, value } = await reader.read();
		if (value) {
			chunks.push(value);
			length += value.length;
		}
		if (done) break;
	}
	return concatBytes(chunks, length);
}
var streamCollector$1;
var init_stream_collector_browser = __esmMin((() => {
	init_concatBytes();
	init_stream_type_check();
	streamCollector$1 = async (stream) => {
		if (isBlob(stream)) return collectBlob(stream);
		return collectReadableStream(stream);
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/serde/util-stream/sdk-stream-mixin.browser.js
var ERR_MSG_STREAM_HAS_BEEN_TRANSFORMED$1, sdkStreamMixin$1, isBlobInstance;
var init_sdk_stream_mixin_browser = __esmMin((() => {
	init_toBase64_browser();
	init_hex_encoding();
	init_toUtf8_browser();
	init_stream_collector_browser();
	init_stream_type_check();
	ERR_MSG_STREAM_HAS_BEEN_TRANSFORMED$1 = "The stream has already been transformed.";
	sdkStreamMixin$1 = (stream) => {
		if (!isBlobInstance(stream) && !isReadableStream(stream)) {
			const name = stream?.__proto__?.constructor?.name || stream;
			throw new Error(`Unexpected stream implementation, expect Blob or ReadableStream, got ${name}`);
		}
		let transformed = false;
		const transformToByteArray = async () => {
			if (transformed) throw new Error(ERR_MSG_STREAM_HAS_BEEN_TRANSFORMED$1);
			transformed = true;
			return await streamCollector$1(stream);
		};
		const blobToWebStream = (blob) => {
			if (typeof blob.stream !== "function") throw new Error("Cannot transform payload Blob to web stream. Please make sure the Blob.stream() is polyfilled.\nIf you are using React Native, this API is not yet supported, see: https://react-native.canny.io/feature-requests/p/fetch-streaming-body");
			return blob.stream();
		};
		return Object.assign(stream, {
			transformToByteArray,
			transformToString: async (encoding) => {
				const buf = await transformToByteArray();
				if (encoding === "base64") return toBase64(buf);
				else if (encoding === "hex") return toHex(buf);
				else if (encoding === void 0 || encoding === "utf8" || encoding === "utf-8") return toUtf8(buf);
				else if (typeof TextDecoder === "function") return new TextDecoder(encoding).decode(buf);
				else throw new Error("TextDecoder is not available, please make sure polyfill is provided.");
			},
			transformToWebStream: () => {
				if (transformed) throw new Error(ERR_MSG_STREAM_HAS_BEEN_TRANSFORMED$1);
				transformed = true;
				if (isBlobInstance(stream)) return blobToWebStream(stream);
				else if (isReadableStream(stream)) return stream;
				else throw new Error(`Cannot transform payload to web stream, got ${stream}`);
			}
		});
	};
	isBlobInstance = (stream) => typeof Blob === "function" && stream instanceof Blob;
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/serde/util-stream/stream-collector.js
var streamCollector, Collector;
var init_stream_collector = __esmMin((() => {
	init_concatBytes();
	init_stream_collector_browser();
	init_stream_type_check();
	streamCollector = (stream) => {
		if (isBlob(stream)) return collectBlob(stream);
		if (isReadableStream(stream)) return collectReadableStream(stream);
		return new Promise((resolve, reject) => {
			const collector = new Collector();
			const nodeStream = stream;
			nodeStream.pipe(collector);
			nodeStream.on("error", (err) => {
				collector.end();
				reject(err);
			});
			collector.on("error", reject);
			collector.on("finish", function() {
				resolve(concatBytes(this.bufferedBytes));
			});
		});
	};
	Collector = class extends Writable {
		bufferedBytes = [];
		_write(chunk, encoding, callback) {
			this.bufferedBytes.push(chunk);
			callback();
		}
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/serde/util-stream/sdk-stream-mixin.js
var ERR_MSG_STREAM_HAS_BEEN_TRANSFORMED, sdkStreamMixin;
var init_sdk_stream_mixin = __esmMin((() => {
	init_buffer_from();
	init_sdk_stream_mixin_browser();
	init_stream_collector();
	ERR_MSG_STREAM_HAS_BEEN_TRANSFORMED = "The stream has already been transformed.";
	sdkStreamMixin = (stream) => {
		if (!(stream instanceof Readable)) try {
			return sdkStreamMixin$1(stream);
		} catch (ignored) {
			const name = stream?.__proto__?.constructor?.name || stream;
			throw new Error(`Unexpected stream implementation, expect Stream.Readable instance, got ${name}`);
		}
		let transformed = false;
		const transformToByteArray = async () => {
			if (transformed) throw new Error(ERR_MSG_STREAM_HAS_BEEN_TRANSFORMED);
			transformed = true;
			return await streamCollector(stream);
		};
		return Object.assign(stream, {
			transformToByteArray,
			transformToString: async (encoding) => {
				const buf = await transformToByteArray();
				if (encoding === void 0 || Buffer.isEncoding(encoding)) return fromArrayBuffer(buf.buffer, buf.byteOffset, buf.byteLength).toString(encoding);
				else return new TextDecoder(encoding).decode(buf);
			},
			transformToWebStream: () => {
				if (transformed) throw new Error(ERR_MSG_STREAM_HAS_BEEN_TRANSFORMED);
				if (stream.readableFlowing !== null) throw new Error("The stream has been consumed by other callbacks.");
				if (typeof Readable.toWeb !== "function") throw new Error("Readable.toWeb() is not supported. Please ensure a polyfill is available.");
				transformed = true;
				return Readable.toWeb(stream);
			}
		});
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/serde/index.js
var Uint8ArrayBlobAdapter, _getRandomValues, v4, generateIdempotencyToken;
var init_serde = __esmMin((() => {
	init_fromBase64();
	init_toBase64();
	init_Uint8ArrayBlobAdapter();
	init_fromUtf8();
	init_toUtf8();
	init_v4();
	init_date_utils();
	init_lazy_json();
	init_parse_utils();
	init_quote_header();
	init_schema_date_utils();
	init_split_every();
	init_split_header();
	init_NumericValue();
	init_hex_encoding();
	init_calculateBodyLength();
	init_toUint8Array();
	init_buffer_from();
	init_is_array_buffer();
	init_transport();
	init_endpoints();
	init_ChecksumStream();
	init_createChecksumStream();
	init_createBufferedReadable();
	init_getAwsChunkedEncodingStream();
	init_stream_type_check();
	init_sdk_stream_mixin();
	init_stream_collector();
	Uint8ArrayBlobAdapter = class extends bindUint8ArrayBlobAdapter(toUtf8$1, fromUtf8$1, toBase64$1, fromBase64) {};
	_getRandomValues = getRandomValues;
	v4 = bindV4(_getRandomValues);
	generateIdempotencyToken = v4;
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/protocols/collect-stream-body.js
var collectBody$1;
var init_collect_stream_body = __esmMin((() => {
	init_serde();
	collectBody$1 = async (streamBody = /* @__PURE__ */ new Uint8Array(), context) => {
		if (streamBody instanceof Uint8Array) return Uint8ArrayBlobAdapter.mutate(streamBody);
		if (!streamBody) return Uint8ArrayBlobAdapter.mutate(/* @__PURE__ */ new Uint8Array());
		const fromContext = context.streamCollector(streamBody);
		return Uint8ArrayBlobAdapter.mutate(await fromContext);
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/protocols/extended-encode-uri-component.js
function extendedEncodeURIComponent(str) {
	return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
		return "%" + c.charCodeAt(0).toString(16).toUpperCase();
	});
}
var init_extended_encode_uri_component = __esmMin((() => {}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/protocols/SerdeContext.js
var SerdeContext;
var init_SerdeContext = __esmMin((() => {
	SerdeContext = class {
		serdeContext;
		setSerdeContext(serdeContext) {
			this.serdeContext = serdeContext;
		}
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/checksum/hash-stream-node/HashCalculator.js
var HashCalculator;
var init_HashCalculator = __esmMin((() => {
	init_serde();
	HashCalculator = class extends Writable {
		hash;
		constructor(hash, options) {
			super(options);
			this.hash = hash;
		}
		_write(chunk, encoding, callback) {
			try {
				this.hash.update(toUint8Array(chunk));
			} catch (err) {
				return callback(err);
			}
			callback();
		}
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/checksum/hash-stream-node/readableStreamHasher.js
var readableStreamHasher;
var init_readableStreamHasher = __esmMin((() => {
	init_HashCalculator();
	readableStreamHasher = (hashCtor, readableStream) => {
		if (readableStream.readableFlowing !== null) throw new Error("Unable to calculate hash for flowing readable stream");
		const hash = new hashCtor();
		const hashCalculator = new HashCalculator(hash);
		readableStream.pipe(hashCalculator);
		return new Promise((resolve, reject) => {
			readableStream.on("error", (err) => {
				hashCalculator.end();
				reject(err);
			});
			hashCalculator.on("error", reject);
			hashCalculator.on("finish", () => {
				hash.digest().then(resolve).catch(reject);
			});
		});
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/checksum/md5/Md5Js.js
function compress(state, block) {
	let a = state[0], b = state[1], c = state[2], d = state[3];
	for (let i = 0; i < 64; ++i) {
		let f, g;
		if (i < 16) {
			f = b & c | ~b & d;
			g = i;
		} else if (i < 32) {
			f = d & b | c & ~d;
			g = (5 * i + 1) % 16;
		} else if (i < 48) {
			f = b ^ c ^ d;
			g = (3 * i + 5) % 16;
		} else {
			f = c ^ (b | ~d);
			g = 7 * i % 16;
		}
		const x = block.getUint32(g * 4, true);
		const tmp = d;
		d = c;
		c = b;
		const s = S$1[(i >> 4) * 4 + (i & 3)];
		const sum = (a + f & M$1) + (x + T$2[i] & M$1) & M$1;
		b = b + ((sum << s | sum >>> 32 - s) >>> 0) & M$1;
		a = tmp;
	}
	state[0] = state[0] + a & M$1;
	state[1] = state[1] + b & M$1;
	state[2] = state[2] + c & M$1;
	state[3] = state[3] + d & M$1;
}
var Md5Js, INIT$2, M$1, S$1, T$2;
var init_Md5Js = __esmMin((() => {
	init_serde();
	Md5Js = class {
		digestLength = 16;
		state = Uint32Array.from(INIT$2);
		writeBuffer = /* @__PURE__ */ new DataView(/* @__PURE__ */ new ArrayBuffer(64));
		bufferLength = 0;
		bytesHashed = 0;
		update(sourceData) {
			const data = toUint8Array(sourceData);
			let pos = 0;
			let len = data.byteLength;
			this.bytesHashed += len;
			while (len > 0) {
				this.writeBuffer.setUint8(this.bufferLength++, data[pos++]);
				--len;
				if (this.bufferLength === 64) {
					compress(this.state, this.writeBuffer);
					this.bufferLength = 0;
				}
			}
		}
		async digest() {
			const state = Uint32Array.from(this.state);
			const buf = new DataView(this.writeBuffer.buffer.slice(0));
			let bufLen = this.bufferLength;
			const bits = this.bytesHashed * 8;
			buf.setUint8(bufLen++, 128);
			if (this.bufferLength % 64 >= 56) {
				for (let i = bufLen; i < 64; ++i) buf.setUint8(i, 0);
				compress(state, buf);
				bufLen = 0;
			}
			for (let i = bufLen; i < 56; ++i) buf.setUint8(i, 0);
			buf.setUint32(56, bits >>> 0, true);
			buf.setUint32(60, Math.floor(bits / 2 ** 32), true);
			compress(state, buf);
			const out = /* @__PURE__ */ new Uint8Array(16);
			const view = new DataView(out.buffer);
			for (let i = 0; i < 4; ++i) view.setUint32(i * 4, state[i], true);
			return out;
		}
		reset() {
			this.state.set(INIT$2);
			this.writeBuffer = /* @__PURE__ */ new DataView(/* @__PURE__ */ new ArrayBuffer(64));
			this.bufferLength = 0;
			this.bytesHashed = 0;
		}
	};
	INIT$2 = [
		1732584193,
		4023233417,
		2562383102,
		271733878
	];
	M$1 = 4294967295;
	S$1 = Uint8Array.of(7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21);
	T$2 = Array.from({ length: 64 }, (_, i) => Math.abs(Math.sin(i + 1)) * 2 ** 32 >>> 0);
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/checksum/md5/Md5Node.js
function buildNativeClass$3() {
	return class Md5Node {
		digestLength = 16;
		hash = createHash("md5");
		update(data) {
			this.hash.update(toUint8Array(data));
		}
		async digest() {
			const buf = this.hash.copy().digest();
			return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
		}
		reset() {
			this.hash = createHash("md5");
		}
	};
}
var hasNativeCrypto$2, Md5Node;
var init_Md5Node = __esmMin((() => {
	init_serde();
	init_Md5Js();
	hasNativeCrypto$2 = (() => {
		try {
			createHash("md5");
			return true;
		} catch {
			return false;
		}
	})();
	Md5Node = hasNativeCrypto$2 ? buildNativeClass$3() : Md5Js;
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/checksum/crc32/Crc32Js.js
var CRC32_TABLE, ONES, Crc32Js;
var init_Crc32Js = __esmMin((() => {
	CRC32_TABLE = /* @__PURE__ */ new Uint32Array(256);
	for (let i = 0; i < 256; ++i) {
		let c = i;
		for (let j = 0; j < 8; ++j) c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
		CRC32_TABLE[i] = c >>> 0;
	}
	ONES = 4294967295;
	Crc32Js = class {
		digestLength = 4;
		checksum = ONES;
		update(data) {
			for (let i = 0; i < data.length; ++i) this.checksum = this.checksum >>> 8 ^ CRC32_TABLE[(this.checksum ^ data[i]) & 255];
		}
		digestSync() {
			return (this.checksum ^ ONES) >>> 0;
		}
		async digest() {
			const value = this.digestSync();
			const out = /* @__PURE__ */ new Uint8Array(4);
			new DataView(out.buffer).setUint32(0, value, false);
			return out;
		}
		reset() {
			this.checksum = ONES;
		}
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/checksum/crc32/Crc32Node.js
function buildNativeClass$2(nativeCrc32) {
	return class Crc32Node {
		digestLength = 4;
		value = 0;
		update(data) {
			this.value = nativeCrc32(data, this.value);
		}
		digestSync() {
			return this.value >>> 0;
		}
		async digest() {
			const out = /* @__PURE__ */ new Uint8Array(4);
			new DataView(out.buffer).setUint32(0, this.digestSync(), false);
			return out;
		}
		reset() {
			this.value = 0;
		}
	};
}
var zlibCrc32, Crc32Node;
var init_Crc32Node = __esmMin((() => {
	init_Crc32Js();
	zlibCrc32 = typeof zlib.crc32 === "function" ? zlib.crc32 : void 0;
	Crc32Node = zlibCrc32 ? buildNativeClass$2(zlibCrc32) : Crc32Js;
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/checksum/sha256/Sha256Js.js
var BLOCK$1, DIGEST_LENGTH$1, MAX_HASHABLE_LENGTH, Sha256Js, INIT$1, K$2;
var init_Sha256Js = __esmMin((() => {
	init_serde();
	BLOCK$1 = 64;
	DIGEST_LENGTH$1 = 32;
	MAX_HASHABLE_LENGTH = 2 ** 53 - 1;
	Sha256Js = class Sha256Js {
		digestLength = DIGEST_LENGTH$1;
		state = Int32Array.from(INIT$1);
		w;
		buffer = /* @__PURE__ */ new Uint8Array(64);
		bufferLength = 0;
		bytesHashed = 0;
		finished = false;
		inner;
		outer;
		constructor(secret) {
			if (secret) {
				const key = Sha256Js.normalizeKey(secret);
				this.inner = new Sha256Js();
				this.outer = new Sha256Js();
				const { inner, outer } = this;
				const pad = /* @__PURE__ */ new Uint8Array(128);
				for (let i = 0; i < BLOCK$1; ++i) {
					pad[i] = 54 ^ key[i];
					pad[i + BLOCK$1] = 92 ^ key[i];
				}
				inner.update(pad.subarray(0, BLOCK$1));
				outer.update(pad.subarray(BLOCK$1));
			}
		}
		update(data) {
			if (this.finished) throw new Error("Attempted to update an already finished HMAC.");
			if (this.inner) {
				this.inner.update(data);
				return;
			}
			const chunk = toUint8Array(data);
			let position = 0;
			let { byteLength } = chunk;
			this.bytesHashed += byteLength;
			if (this.bytesHashed * 8 > MAX_HASHABLE_LENGTH) throw new Error("Cannot hash more than 2^53 - 1 bits");
			while (byteLength > 0) {
				this.buffer[this.bufferLength++] = chunk[position++];
				byteLength--;
				if (this.bufferLength === BLOCK$1) {
					this.hashBuffer();
					this.bufferLength = 0;
				}
			}
		}
		async digest() {
			const { inner, outer } = this;
			if (inner && outer) {
				if (this.finished) throw new Error("Attempted to digest an already finished HMAC.");
				this.finished = true;
				const innerDigest = inner.digestSync();
				outer.update(innerDigest);
				return outer.digestSync();
			}
			return this.digestSync();
		}
		reset() {
			this.state = Int32Array.from(INIT$1);
			this.buffer = /* @__PURE__ */ new Uint8Array(64);
			this.bufferLength = 0;
			this.bytesHashed = 0;
		}
		digestSync() {
			const state = this.state.slice();
			const buffer = this.buffer.slice();
			let bufferLength = this.bufferLength;
			const bitsHashed = this.bytesHashed * 8;
			const bufferView = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
			bufferView.setUint8(bufferLength++, 128);
			if ((bufferLength - 1) % BLOCK$1 >= 56) {
				for (let i = bufferLength; i < BLOCK$1; ++i) bufferView.setUint8(i, 0);
				this.hashBufferWith(state, buffer);
				bufferLength = 0;
			}
			for (let i = bufferLength; i < 56; ++i) bufferView.setUint8(i, 0);
			bufferView.setUint32(56, Math.floor(bitsHashed / 4294967296), false);
			bufferView.setUint32(60, bitsHashed, false);
			this.hashBufferWith(state, buffer);
			const out = new Uint8Array(DIGEST_LENGTH$1);
			for (let i = 0; i < 8; ++i) {
				out[i * 4] = state[i] >>> 24 & 255;
				out[i * 4 + 1] = state[i] >>> 16 & 255;
				out[i * 4 + 2] = state[i] >>> 8 & 255;
				out[i * 4 + 3] = state[i] >>> 0 & 255;
			}
			return out;
		}
		static normalizeKey(secret) {
			const key = toUint8Array(secret);
			if (key.byteLength > BLOCK$1) {
				const h = new Sha256Js();
				h.update(key);
				const out = h.digestSync();
				const padded = new Uint8Array(BLOCK$1);
				padded.set(out);
				return padded;
			}
			if (key.byteLength < BLOCK$1) {
				const padded = new Uint8Array(BLOCK$1);
				padded.set(key);
				return padded;
			}
			return key;
		}
		hashBuffer() {
			this.hashBufferWith(this.state, this.buffer);
		}
		hashBufferWith(state, buffer) {
			const w = this.w ??= /* @__PURE__ */ new Int32Array(64);
			let s0 = state[0], s1 = state[1], s2 = state[2], s3 = state[3], s4 = state[4], s5 = state[5], s6 = state[6], s7 = state[7];
			for (let i = 0; i < BLOCK$1; ++i) {
				if (i < 16) w[i] = (buffer[i * 4] & 255) << 24 | (buffer[i * 4 + 1] & 255) << 16 | (buffer[i * 4 + 2] & 255) << 8 | buffer[i * 4 + 3] & 255;
				else {
					let u = w[i - 2];
					const t1 = (u >>> 17 | u << 15) ^ (u >>> 19 | u << 13) ^ u >>> 10;
					u = w[i - 15];
					const t2 = (u >>> 7 | u << 25) ^ (u >>> 18 | u << 14) ^ u >>> 3;
					w[i] = (t1 + w[i - 7] | 0) + (t2 + w[i - 16] | 0);
				}
				const t1 = (((s4 >>> 6 | s4 << 26) ^ (s4 >>> 11 | s4 << 21) ^ (s4 >>> 25 | s4 << 7)) + (s4 & s5 ^ ~s4 & s6) | 0) + (s7 + (K$2[i] + w[i] | 0) | 0) | 0;
				const t2 = ((s0 >>> 2 | s0 << 30) ^ (s0 >>> 13 | s0 << 19) ^ (s0 >>> 22 | s0 << 10)) + (s0 & s1 ^ s0 & s2 ^ s1 & s2) | 0;
				s7 = s6;
				s6 = s5;
				s5 = s4;
				s4 = s3 + t1 | 0;
				s3 = s2;
				s2 = s1;
				s1 = s0;
				s0 = t1 + t2 | 0;
			}
			state[0] += s0;
			state[1] += s1;
			state[2] += s2;
			state[3] += s3;
			state[4] += s4;
			state[5] += s5;
			state[6] += s6;
			state[7] += s7;
		}
	};
	INIT$1 = new Int32Array([
		1779033703,
		3144134277,
		1013904242,
		2773480762,
		1359893119,
		2600822924,
		528734635,
		1541459225
	]);
	K$2 = new Int32Array([
		1116352408,
		1899447441,
		3049323471,
		3921009573,
		961987163,
		1508970993,
		2453635748,
		2870763221,
		3624381080,
		310598401,
		607225278,
		1426881987,
		1925078388,
		2162078206,
		2614888103,
		3248222580,
		3835390401,
		4022224774,
		264347078,
		604807628,
		770255983,
		1249150122,
		1555081692,
		1996064986,
		2554220882,
		2821834349,
		2952996808,
		3210313671,
		3336571891,
		3584528711,
		113926993,
		338241895,
		666307205,
		773529912,
		1294757372,
		1396182291,
		1695183700,
		1986661051,
		2177026350,
		2456956037,
		2730485921,
		2820302411,
		3259730800,
		3345764771,
		3516065817,
		3600352804,
		4094571909,
		275423344,
		430227734,
		506948616,
		659060556,
		883997877,
		958139571,
		1322822218,
		1537002063,
		1747873779,
		1955562222,
		2024104815,
		2227730452,
		2361852424,
		2428436474,
		2756734187,
		3204031479,
		3329325298
	]);
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/checksum/sha256/Sha256Node.js
function buildNativeClass$1() {
	return class Sha256Node {
		digestLength = 32;
		secret;
		hash;
		isHmac;
		finished = false;
		constructor(secret) {
			this.secret = secret;
			this.isHmac = !!secret;
			this.hash = this.createHash();
		}
		update(data) {
			if (this.finished) throw new Error("Attempted to update an already finished hash.");
			this.hash.update(data);
		}
		async digest() {
			let buf;
			if (this.isHmac) {
				this.finished = true;
				buf = this.hash.digest();
			} else buf = this.hash.copy().digest();
			return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
		}
		reset() {
			this.hash = this.createHash();
			this.finished = false;
		}
		createHash() {
			return this.secret ? createHmac("sha256", toBuffer$1(this.secret)) : createHash("sha256");
		}
	};
}
function toBuffer$1(data) {
	if (typeof data === "string") return data;
	if (ArrayBuffer.isView(data)) return Buffer.from(data.buffer, data.byteOffset, data.byteLength);
	return Buffer.from(data);
}
var hasNativeCrypto$1, Sha256Node;
var init_Sha256Node = __esmMin((() => {
	init_Sha256Js();
	hasNativeCrypto$1 = (() => {
		try {
			createHash("sha256");
			return true;
		} catch {
			return false;
		}
	})();
	Sha256Node = hasNativeCrypto$1 ? buildNativeClass$1() : Sha256Js;
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/checksum/index.js
var init_checksum = __esmMin((() => {
	init_HashCalculator();
	init_readableStreamHasher();
	init_Md5Js();
	init_Md5Node();
	init_Crc32Js();
	init_Crc32Node();
	init_Sha256Js();
	init_Sha256Node();
	init_serde();
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-codec/Int64.js
function negate$1(bytes) {
	for (let i = 0; i < 8; i++) bytes[i] ^= 255;
	for (let i = 7; i > -1; i--) {
		bytes[i]++;
		if (bytes[i] !== 0) break;
	}
}
var Int64$1;
var init_Int64 = __esmMin((() => {
	init_serde();
	Int64$1 = class Int64$1 {
		bytes;
		constructor(bytes) {
			this.bytes = bytes;
			if (bytes.byteLength !== 8) throw new Error("Int64 buffers must be exactly 8 bytes");
		}
		static fromNumber(number) {
			if (number > 0x8000000000000000 || number < -0x8000000000000000) throw new Error(`${number} is too large (or, if negative, too small) to represent as an Int64`);
			const bytes = /* @__PURE__ */ new Uint8Array(8);
			for (let i = 7, remaining = Math.abs(Math.round(number)); i > -1 && remaining > 0; i--, remaining /= 256) bytes[i] = remaining;
			if (number < 0) negate$1(bytes);
			return new Int64$1(bytes);
		}
		valueOf() {
			const bytes = this.bytes.slice(0);
			const negative = bytes[0] & 128;
			if (negative) negate$1(bytes);
			return parseInt(toHex(bytes), 16) * (negative ? -1 : 1);
		}
		toString() {
			return String(this.valueOf());
		}
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-codec/HeaderMarshaller.js
var HeaderMarshaller, HEADER_VALUE_TYPE$1, BOOLEAN_TAG, BYTE_TAG, SHORT_TAG, INT_TAG, LONG_TAG, BINARY_TAG, STRING_TAG, TIMESTAMP_TAG, UUID_TAG, UUID_PATTERN$1;
var init_HeaderMarshaller = __esmMin((() => {
	init_transport();
	init_serde();
	init_Int64();
	HeaderMarshaller = class {
		toUtf8;
		fromUtf8;
		constructor(toUtf8, fromUtf8) {
			this.toUtf8 = toUtf8;
			this.fromUtf8 = fromUtf8;
		}
		format(headers) {
			const chunks = [];
			for (const headerName in headers) {
				if (!hasOwn(headers, headerName)) continue;
				const bytes = this.fromUtf8(headerName);
				chunks.push(Uint8Array.from([bytes.byteLength]), bytes, this.formatHeaderValue(headers[headerName]));
			}
			const out = new Uint8Array(chunks.reduce((carry, bytes) => carry + bytes.byteLength, 0));
			let position = 0;
			for (const chunk of chunks) {
				out.set(chunk, position);
				position += chunk.byteLength;
			}
			return out;
		}
		formatHeaderValue(header) {
			switch (header.type) {
				case "boolean": return Uint8Array.from([header.value ? 0 : 1]);
				case "byte": return Uint8Array.from([2, header.value]);
				case "short":
					const shortView = /* @__PURE__ */ new DataView(/* @__PURE__ */ new ArrayBuffer(3));
					shortView.setUint8(0, 3);
					shortView.setInt16(1, header.value, false);
					return new Uint8Array(shortView.buffer);
				case "integer":
					const intView = /* @__PURE__ */ new DataView(/* @__PURE__ */ new ArrayBuffer(5));
					intView.setUint8(0, 4);
					intView.setInt32(1, header.value, false);
					return new Uint8Array(intView.buffer);
				case "long":
					const longBytes = /* @__PURE__ */ new Uint8Array(9);
					longBytes[0] = 5;
					longBytes.set(header.value.bytes, 1);
					return longBytes;
				case "binary":
					const binView = new DataView(new ArrayBuffer(3 + header.value.byteLength));
					binView.setUint8(0, 6);
					binView.setUint16(1, header.value.byteLength, false);
					const binBytes = new Uint8Array(binView.buffer);
					binBytes.set(header.value, 3);
					return binBytes;
				case "string":
					const utf8Bytes = this.fromUtf8(header.value);
					const strView = new DataView(new ArrayBuffer(3 + utf8Bytes.byteLength));
					strView.setUint8(0, 7);
					strView.setUint16(1, utf8Bytes.byteLength, false);
					const strBytes = new Uint8Array(strView.buffer);
					strBytes.set(utf8Bytes, 3);
					return strBytes;
				case "timestamp":
					const tsBytes = /* @__PURE__ */ new Uint8Array(9);
					tsBytes[0] = 8;
					tsBytes.set(Int64$1.fromNumber(header.value.valueOf()).bytes, 1);
					return tsBytes;
				case "uuid":
					if (!UUID_PATTERN$1.test(header.value)) throw new Error(`Invalid UUID received: ${header.value}`);
					const uuidBytes = /* @__PURE__ */ new Uint8Array(17);
					uuidBytes[0] = 9;
					uuidBytes.set(fromHex(header.value.replace(/-/g, "")), 1);
					return uuidBytes;
			}
		}
		parse(headers) {
			const out = {};
			let position = 0;
			while (position < headers.byteLength) {
				const nameLength = headers.getUint8(position++);
				const name = this.toUtf8(new Uint8Array(headers.buffer, headers.byteOffset + position, nameLength));
				position += nameLength;
				switch (headers.getUint8(position++)) {
					case 0:
						out[name] = {
							type: BOOLEAN_TAG,
							value: true
						};
						break;
					case 1:
						out[name] = {
							type: BOOLEAN_TAG,
							value: false
						};
						break;
					case 2:
						out[name] = {
							type: BYTE_TAG,
							value: headers.getInt8(position++)
						};
						break;
					case 3:
						out[name] = {
							type: SHORT_TAG,
							value: headers.getInt16(position, false)
						};
						position += 2;
						break;
					case 4:
						out[name] = {
							type: INT_TAG,
							value: headers.getInt32(position, false)
						};
						position += 4;
						break;
					case 5:
						out[name] = {
							type: LONG_TAG,
							value: new Int64$1(new Uint8Array(headers.buffer, headers.byteOffset + position, 8))
						};
						position += 8;
						break;
					case 6:
						const binaryLength = headers.getUint16(position, false);
						position += 2;
						out[name] = {
							type: BINARY_TAG,
							value: new Uint8Array(headers.buffer, headers.byteOffset + position, binaryLength)
						};
						position += binaryLength;
						break;
					case 7:
						const stringLength = headers.getUint16(position, false);
						position += 2;
						out[name] = {
							type: STRING_TAG,
							value: this.toUtf8(new Uint8Array(headers.buffer, headers.byteOffset + position, stringLength))
						};
						position += stringLength;
						break;
					case 8:
						out[name] = {
							type: TIMESTAMP_TAG,
							value: new Date(new Int64$1(new Uint8Array(headers.buffer, headers.byteOffset + position, 8)).valueOf())
						};
						position += 8;
						break;
					case 9:
						const uuidBytes = new Uint8Array(headers.buffer, headers.byteOffset + position, 16);
						position += 16;
						out[name] = {
							type: UUID_TAG,
							value: `${toHex(uuidBytes.subarray(0, 4))}-${toHex(uuidBytes.subarray(4, 6))}-${toHex(uuidBytes.subarray(6, 8))}-${toHex(uuidBytes.subarray(8, 10))}-${toHex(uuidBytes.subarray(10))}`
						};
						break;
					default: throw new Error(`Unrecognized header type tag`);
				}
			}
			return out;
		}
	};
	(function(HEADER_VALUE_TYPE) {
		HEADER_VALUE_TYPE[HEADER_VALUE_TYPE["boolTrue"] = 0] = "boolTrue";
		HEADER_VALUE_TYPE[HEADER_VALUE_TYPE["boolFalse"] = 1] = "boolFalse";
		HEADER_VALUE_TYPE[HEADER_VALUE_TYPE["byte"] = 2] = "byte";
		HEADER_VALUE_TYPE[HEADER_VALUE_TYPE["short"] = 3] = "short";
		HEADER_VALUE_TYPE[HEADER_VALUE_TYPE["integer"] = 4] = "integer";
		HEADER_VALUE_TYPE[HEADER_VALUE_TYPE["long"] = 5] = "long";
		HEADER_VALUE_TYPE[HEADER_VALUE_TYPE["byteArray"] = 6] = "byteArray";
		HEADER_VALUE_TYPE[HEADER_VALUE_TYPE["string"] = 7] = "string";
		HEADER_VALUE_TYPE[HEADER_VALUE_TYPE["timestamp"] = 8] = "timestamp";
		HEADER_VALUE_TYPE[HEADER_VALUE_TYPE["uuid"] = 9] = "uuid";
	})(HEADER_VALUE_TYPE$1 || (HEADER_VALUE_TYPE$1 = {}));
	BOOLEAN_TAG = "boolean";
	BYTE_TAG = "byte";
	SHORT_TAG = "short";
	INT_TAG = "integer";
	LONG_TAG = "long";
	BINARY_TAG = "binary";
	STRING_TAG = "string";
	TIMESTAMP_TAG = "timestamp";
	UUID_TAG = "uuid";
	UUID_PATTERN$1 = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-codec/splitMessage.js
function splitMessage({ byteLength, byteOffset, buffer }) {
	if (byteLength < MINIMUM_MESSAGE_LENGTH) throw new Error("Provided message too short to accommodate event stream message overhead");
	const view = new DataView(buffer, byteOffset, byteLength);
	const messageLength = view.getUint32(0, false);
	if (byteLength !== messageLength) throw new Error("Reported message length does not match received message length");
	const headerLength = view.getUint32(PRELUDE_MEMBER_LENGTH, false);
	const expectedPreludeChecksum = view.getUint32(PRELUDE_LENGTH, false);
	const expectedMessageChecksum = view.getUint32(byteLength - CHECKSUM_LENGTH, false);
	const checksummer = new Crc32Node();
	checksummer.update(new Uint8Array(buffer, byteOffset, PRELUDE_LENGTH));
	if (expectedPreludeChecksum !== checksummer.digestSync()) throw new Error(`The prelude checksum specified in the message (${expectedPreludeChecksum}) does not match the calculated CRC32 checksum (${checksummer.digestSync()})`);
	checksummer.update(new Uint8Array(buffer, byteOffset + PRELUDE_LENGTH, byteLength - 12));
	if (expectedMessageChecksum !== checksummer.digestSync()) throw new Error(`The message checksum (${checksummer.digestSync()}) did not match the expected value of ${expectedMessageChecksum}`);
	return {
		headers: new DataView(buffer, byteOffset + PRELUDE_LENGTH + CHECKSUM_LENGTH, headerLength),
		body: new Uint8Array(buffer, byteOffset + PRELUDE_LENGTH + CHECKSUM_LENGTH + headerLength, messageLength - headerLength - 16)
	};
}
var PRELUDE_MEMBER_LENGTH, PRELUDE_LENGTH, CHECKSUM_LENGTH, MINIMUM_MESSAGE_LENGTH;
var init_splitMessage = __esmMin((() => {
	init_checksum();
	PRELUDE_MEMBER_LENGTH = 4;
	PRELUDE_LENGTH = 8;
	CHECKSUM_LENGTH = 4;
	MINIMUM_MESSAGE_LENGTH = 16;
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-codec/EventStreamCodec.js
var EventStreamCodec;
var init_EventStreamCodec = __esmMin((() => {
	init_checksum();
	init_HeaderMarshaller();
	init_splitMessage();
	EventStreamCodec = class {
		headerMarshaller;
		messageBuffer;
		isEndOfStream;
		constructor(toUtf8, fromUtf8) {
			this.headerMarshaller = new HeaderMarshaller(toUtf8, fromUtf8);
			this.messageBuffer = [];
			this.isEndOfStream = false;
		}
		feed(message) {
			this.messageBuffer.push(this.decode(message));
		}
		endOfStream() {
			this.isEndOfStream = true;
		}
		getMessage() {
			const message = this.messageBuffer.pop();
			const isEndOfStream = this.isEndOfStream;
			return {
				getMessage() {
					return message;
				},
				isEndOfStream() {
					return isEndOfStream;
				}
			};
		}
		getAvailableMessages() {
			const messages = this.messageBuffer;
			this.messageBuffer = [];
			const isEndOfStream = this.isEndOfStream;
			return {
				getMessages() {
					return messages;
				},
				isEndOfStream() {
					return isEndOfStream;
				}
			};
		}
		encode({ headers: rawHeaders, body }) {
			const headers = this.headerMarshaller.format(rawHeaders);
			const length = headers.byteLength + body.byteLength + 16;
			const out = new Uint8Array(length);
			const view = new DataView(out.buffer, out.byteOffset, out.byteLength);
			const checksum = new Crc32Node();
			view.setUint32(0, length, false);
			view.setUint32(4, headers.byteLength, false);
			checksum.update(out.subarray(0, 8));
			view.setUint32(8, checksum.digestSync(), false);
			out.set(headers, 12);
			out.set(body, headers.byteLength + 12);
			checksum.update(out.subarray(8, length - 4));
			view.setUint32(length - 4, checksum.digestSync(), false);
			return out;
		}
		decode(message) {
			const { headers, body } = splitMessage(message);
			return {
				headers: this.headerMarshaller.parse(headers),
				body
			};
		}
		formatHeaders(rawHeaders) {
			return this.headerMarshaller.format(rawHeaders);
		}
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-codec/MessageDecoderStream.js
var MessageDecoderStream;
var init_MessageDecoderStream = __esmMin((() => {
	MessageDecoderStream = class {
		options;
		constructor(options) {
			this.options = options;
		}
		[Symbol.asyncIterator]() {
			return this.asyncIterator();
		}
		async *asyncIterator() {
			for await (const bytes of this.options.inputStream) yield this.options.decoder.decode(bytes);
		}
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-codec/MessageEncoderStream.js
var MessageEncoderStream;
var init_MessageEncoderStream = __esmMin((() => {
	MessageEncoderStream = class {
		options;
		constructor(options) {
			this.options = options;
		}
		[Symbol.asyncIterator]() {
			return this.asyncIterator();
		}
		async *asyncIterator() {
			for await (const msg of this.options.messageStream) yield this.options.encoder.encode(msg);
			if (this.options.includeEndFrame) yield /* @__PURE__ */ new Uint8Array(0);
		}
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-codec/SmithyMessageDecoderStream.js
var SmithyMessageDecoderStream;
var init_SmithyMessageDecoderStream = __esmMin((() => {
	SmithyMessageDecoderStream = class {
		options;
		constructor(options) {
			this.options = options;
		}
		[Symbol.asyncIterator]() {
			return this.asyncIterator();
		}
		async *asyncIterator() {
			for await (const message of this.options.messageStream) {
				const deserialized = await this.options.deserializer(message);
				if (deserialized === void 0) continue;
				yield deserialized;
			}
		}
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-codec/SmithyMessageEncoderStream.js
var SmithyMessageEncoderStream;
var init_SmithyMessageEncoderStream = __esmMin((() => {
	SmithyMessageEncoderStream = class {
		options;
		constructor(options) {
			this.options = options;
		}
		[Symbol.asyncIterator]() {
			return this.asyncIterator();
		}
		async *asyncIterator() {
			for await (const chunk of this.options.inputStream) yield this.options.serializer(chunk);
		}
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-serde-universal/getChunkedStream.js
function getChunkedStream(source) {
	let currentMessageTotalLength = 0;
	let currentMessagePendingLength = 0;
	let currentMessage = null;
	let messageLengthBuffer = null;
	const allocateMessage = (size) => {
		if (typeof size !== "number") throw new Error("Attempted to allocate an event message where size was not a number: " + size);
		currentMessageTotalLength = size;
		currentMessagePendingLength = 4;
		currentMessage = new Uint8Array(size);
		new DataView(currentMessage.buffer).setUint32(0, size, false);
	};
	const iterator = async function* () {
		const sourceIterator = source[Symbol.asyncIterator]();
		while (true) {
			const { value, done } = await sourceIterator.next();
			if (done) {
				if (!currentMessageTotalLength) return;
				else if (currentMessageTotalLength === currentMessagePendingLength) yield currentMessage;
				else throw new Error("Truncated event message received.");
				return;
			}
			const chunkLength = value.length;
			let currentOffset = 0;
			while (currentOffset < chunkLength) {
				if (!currentMessage) {
					const bytesRemaining = chunkLength - currentOffset;
					if (!messageLengthBuffer) messageLengthBuffer = /* @__PURE__ */ new Uint8Array(4);
					const numBytesForTotal = Math.min(4 - currentMessagePendingLength, bytesRemaining);
					messageLengthBuffer.set(value.slice(currentOffset, currentOffset + numBytesForTotal), currentMessagePendingLength);
					currentMessagePendingLength += numBytesForTotal;
					currentOffset += numBytesForTotal;
					if (currentMessagePendingLength < 4) break;
					allocateMessage(new DataView(messageLengthBuffer.buffer).getUint32(0, false));
					messageLengthBuffer = null;
				}
				const numBytesToWrite = Math.min(currentMessageTotalLength - currentMessagePendingLength, chunkLength - currentOffset);
				currentMessage.set(value.slice(currentOffset, currentOffset + numBytesToWrite), currentMessagePendingLength);
				currentMessagePendingLength += numBytesToWrite;
				currentOffset += numBytesToWrite;
				if (currentMessageTotalLength && currentMessageTotalLength === currentMessagePendingLength) {
					yield currentMessage;
					currentMessage = null;
					currentMessageTotalLength = 0;
					currentMessagePendingLength = 0;
				}
			}
		}
	};
	return { [Symbol.asyncIterator]: iterator };
}
var init_getChunkedStream = __esmMin((() => {}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-serde-universal/getUnmarshalledStream.js
function getUnmarshalledStream(source, options) {
	const messageUnmarshaller = getMessageUnmarshaller(options.deserializer, options.toUtf8);
	return { [Symbol.asyncIterator]: async function* () {
		for await (const chunk of source) {
			const message = options.eventStreamCodec.decode(chunk);
			const type = await messageUnmarshaller(message);
			if (type === void 0) continue;
			yield type;
		}
	} };
}
function getMessageUnmarshaller(deserializer, toUtf8) {
	return async function(message) {
		const { value: messageType } = message.headers[":message-type"];
		if (messageType === "error") {
			const unmodeledError = new Error(message.headers[":error-message"].value || "UnknownError");
			unmodeledError.name = message.headers[":error-code"].value;
			throw unmodeledError;
		} else if (messageType === "exception") {
			const code = message.headers[":exception-type"].value;
			const deserializedException = await deserializer({ [code]: message });
			if (deserializedException.$unknown) {
				const error = new Error(toUtf8(message.body));
				error.name = code;
				throw error;
			}
			throw deserializedException[code];
		} else if (messageType === "event") {
			const deserialized = await deserializer({ [message.headers[":event-type"].value]: message });
			if (deserialized.$unknown) return;
			return deserialized;
		} else throw Error(`Unrecognizable event type: ${message.headers[":event-type"].value}`);
	};
}
var init_getUnmarshalledStream = __esmMin((() => {}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-serde-universal/EventStreamMarshaller.js
var EventStreamMarshaller$1, eventStreamSerdeProvider$1;
var init_EventStreamMarshaller$1 = __esmMin((() => {
	init_EventStreamCodec();
	init_MessageDecoderStream();
	init_MessageEncoderStream();
	init_SmithyMessageDecoderStream();
	init_SmithyMessageEncoderStream();
	init_getChunkedStream();
	init_getUnmarshalledStream();
	EventStreamMarshaller$1 = class {
		eventStreamCodec;
		utfEncoder;
		constructor({ utf8Encoder, utf8Decoder }) {
			this.eventStreamCodec = new EventStreamCodec(utf8Encoder, utf8Decoder);
			this.utfEncoder = utf8Encoder;
		}
		deserialize(body, deserializer) {
			const inputStream = getChunkedStream(body);
			return new SmithyMessageDecoderStream({
				messageStream: new MessageDecoderStream({
					inputStream,
					decoder: this.eventStreamCodec
				}),
				deserializer: getMessageUnmarshaller(deserializer, this.utfEncoder)
			});
		}
		serialize(inputStream, serializer) {
			return new MessageEncoderStream({
				messageStream: new SmithyMessageEncoderStream({
					inputStream,
					serializer
				}),
				encoder: this.eventStreamCodec,
				includeEndFrame: true
			});
		}
	};
	eventStreamSerdeProvider$1 = (options) => new EventStreamMarshaller$1(options);
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-serde/EventStreamMarshaller.js
async function* readableToIterable(readStream) {
	let streamEnded = false;
	let generationEnded = false;
	const records = new Array();
	readStream.on("error", (err) => {
		if (!streamEnded) streamEnded = true;
		if (err) throw err;
	});
	readStream.on("data", (data) => {
		records.push(data);
	});
	readStream.on("end", () => {
		streamEnded = true;
	});
	while (!generationEnded) {
		const value = await new Promise((resolve) => setTimeout(() => resolve(records.shift()), 0));
		if (value) yield value;
		generationEnded = streamEnded && records.length === 0;
	}
}
var EventStreamMarshaller, eventStreamSerdeProvider;
var init_EventStreamMarshaller = __esmMin((() => {
	init_EventStreamMarshaller$1();
	EventStreamMarshaller = class {
		universalMarshaller;
		constructor({ utf8Encoder, utf8Decoder }) {
			this.universalMarshaller = new EventStreamMarshaller$1({
				utf8Decoder,
				utf8Encoder
			});
		}
		deserialize(body, deserializer) {
			const bodyIterable = typeof body[Symbol.asyncIterator] === "function" ? body : readableToIterable(body);
			return this.universalMarshaller.deserialize(bodyIterable, deserializer);
		}
		serialize(input, serializer) {
			return Readable.from(this.universalMarshaller.serialize(input, serializer));
		}
	};
	eventStreamSerdeProvider = (options) => new EventStreamMarshaller(options);
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-serde/utils.js
var readableStreamToIterable, iterableToReadableStream;
var init_utils$1 = __esmMin((() => {
	readableStreamToIterable = (readableStream) => ({ [Symbol.asyncIterator]: async function* () {
		const reader = readableStream.getReader();
		try {
			while (true) {
				const { done, value } = await reader.read();
				if (done) return;
				yield value;
			}
		} finally {
			reader.releaseLock();
		}
	} });
	iterableToReadableStream = (asyncIterable) => {
		const iterator = asyncIterable[Symbol.asyncIterator]();
		return new ReadableStream({ async pull(controller) {
			const { done, value } = await iterator.next();
			if (done) return controller.close();
			controller.enqueue(value);
		} });
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-serde-config-resolver/EventStreamSerdeConfig.js
var resolveEventStreamSerdeConfig;
var init_EventStreamSerdeConfig = __esmMin((() => {
	resolveEventStreamSerdeConfig = (input) => Object.assign(input, { eventStreamMarshaller: input.eventStreamSerdeProvider(input) });
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/event-streams/EventStreamSerde.js
var EventStreamSerde;
var init_EventStreamSerde = __esmMin((() => {
	init_transport();
	init_schema();
	init_serde();
	EventStreamSerde = class {
		marshaller;
		serializer;
		deserializer;
		serdeContext;
		defaultContentType;
		compositeErrorRegistry;
		constructor({ marshaller, serializer, deserializer, serdeContext, defaultContentType, compositeErrorRegistry }) {
			this.marshaller = marshaller;
			this.serializer = serializer;
			this.deserializer = deserializer;
			this.serdeContext = serdeContext;
			this.defaultContentType = defaultContentType;
			this.compositeErrorRegistry = compositeErrorRegistry;
		}
		async serializeEventStream({ eventStream, requestSchema, initialRequest, initialMessageType }) {
			const marshaller = this.marshaller;
			const eventStreamMember = requestSchema.getEventStreamMember();
			const unionSchema = requestSchema.getMemberSchema(eventStreamMember);
			const serializer = this.serializer;
			const defaultContentType = this.defaultContentType;
			const initialRequestMarker = Symbol("initialRequestMarker");
			const eventStreamIterable = { async *[Symbol.asyncIterator]() {
				if (initialRequest) {
					const headers = {
						":event-type": {
							type: "string",
							value: initialMessageType ?? "initial-request"
						},
						":message-type": {
							type: "string",
							value: "event"
						},
						":content-type": {
							type: "string",
							value: defaultContentType
						}
					};
					serializer.write(requestSchema, initialRequest);
					const body = serializer.flush();
					yield {
						[initialRequestMarker]: true,
						headers,
						body
					};
				}
				for await (const page of eventStream) yield page;
			} };
			return marshaller.serialize(eventStreamIterable, (event) => {
				if (event[initialRequestMarker]) return {
					headers: event.headers,
					body: event.body
				};
				let unionMember = "";
				for (const key in event) {
					if (!hasOwn(event, key)) continue;
					if (key !== "__type") {
						unionMember = key;
						break;
					}
				}
				const { additionalHeaders, body, eventType, explicitPayloadContentType } = this.writeEventBody(unionMember, unionSchema, event);
				return {
					headers: {
						":event-type": {
							type: "string",
							value: eventType
						},
						":message-type": {
							type: "string",
							value: "event"
						},
						":content-type": {
							type: "string",
							value: explicitPayloadContentType ?? defaultContentType
						},
						...additionalHeaders
					},
					body
				};
			});
		}
		async deserializeEventStream({ response, responseSchema, initialResponseContainer, initialMessageType }) {
			const marshaller = this.marshaller;
			const eventStreamMember = responseSchema.getEventStreamMember();
			const memberSchemas = responseSchema.getMemberSchema(eventStreamMember).getMemberSchemas();
			const initialResponseMarker = Symbol("initialResponseMarker");
			const asyncIterable = marshaller.deserialize(response.body, async (event) => {
				let unionMember = "";
				for (const key in event) {
					if (!hasOwn(event, key)) continue;
					if (key !== "__type") {
						unionMember = key;
						break;
					}
				}
				const body = event[unionMember].body;
				if (unionMember === (initialMessageType ?? "initial-response")) {
					const dataObject = await this.deserializer.read(responseSchema, body);
					delete dataObject[eventStreamMember];
					return {
						[initialResponseMarker]: true,
						...dataObject
					};
				} else if (unionMember in memberSchemas) {
					const eventStreamSchema = memberSchemas[unionMember];
					if (eventStreamSchema.isStructSchema()) {
						const out = {};
						let hasBindings = false;
						for (const [name, member] of eventStreamSchema.structIterator()) {
							const { eventHeader, eventPayload } = member.getMergedTraits();
							hasBindings = hasBindings || Boolean(eventHeader || eventPayload);
							if (eventPayload) {
								if (member.isBlobSchema()) out[name] = body;
								else if (member.isStringSchema()) out[name] = (this.serdeContext?.utf8Encoder ?? toUtf8$1)(body);
								else if (member.isStructSchema()) out[name] = await this.deserializer.read(member, body);
							} else if (eventHeader) {
								const value = event[unionMember].headers[name]?.value;
								if (value != null) {
									if (member.isNumericSchema()) {
										if (value && typeof value === "object" && "bytes" in value) out[name] = BigInt(value.toString());
										else out[name] = Number(value);
									} else out[name] = value;
								}
							}
						}
						return { [unionMember]: await this.readEventMember(eventStreamSchema, body, hasBindings, out) };
					}
					return { [unionMember]: await this.deserializer.read(eventStreamSchema, body) };
				} else return { $unknown: event };
			});
			const asyncIterator = asyncIterable[Symbol.asyncIterator]();
			const firstEvent = await asyncIterator.next();
			if (firstEvent.done) return asyncIterable;
			if (firstEvent.value?.[initialResponseMarker]) {
				if (!responseSchema) throw new Error("@smithy::core/protocols - initial-response event encountered in event stream but no response schema given.");
				for (const key in firstEvent.value) {
					if (!hasOwn(firstEvent.value, key)) continue;
					initialResponseContainer[key] = firstEvent.value[key];
				}
			}
			return { async *[Symbol.asyncIterator]() {
				if (!firstEvent?.value?.[initialResponseMarker]) yield firstEvent.value;
				while (true) {
					const { done, value } = await asyncIterator.next();
					if (done) break;
					yield value;
				}
			} };
		}
		async readEventMember(eventStreamSchema, body, hasBindings, out) {
			let ErrCtor;
			const staticStructuralSchema = eventStreamSchema.getSchema();
			if (Array.isArray(staticStructuralSchema) && staticStructuralSchema[0] === -3) {
				const namespace = staticStructuralSchema[1];
				const nsRegistry = TypeRegistry.for(namespace);
				this.compositeErrorRegistry?.copyFrom(nsRegistry);
				ErrCtor = (this.compositeErrorRegistry ?? nsRegistry)?.getErrorCtor(staticStructuralSchema);
			}
			const dataObject = hasBindings ? out : body.byteLength === 0 ? {} : await this.deserializer.read(eventStreamSchema, body);
			if (ErrCtor) {
				const message = dataObject.message ?? dataObject.Message ?? "Unknown";
				const metadata = {};
				const $fault = eventStreamSchema.getMergedTraits().error;
				if ($fault) metadata.$fault = $fault;
				return Object.assign(new ErrCtor({}), metadata, { message }, dataObject);
			}
			return dataObject;
		}
		writeEventBody(unionMember, unionSchema, event) {
			const serializer = this.serializer;
			let eventType = unionMember;
			let explicitPayloadMember = null;
			let explicitPayloadContentType;
			const isKnownSchema = (() => {
				return unionSchema.getSchema()[4].includes(unionMember);
			})();
			const additionalHeaders = {};
			if (!isKnownSchema) {
				const [type, value] = event[unionMember];
				eventType = type;
				serializer.write(15, value);
			} else {
				const eventSchema = unionSchema.getMemberSchema(unionMember);
				if (eventSchema.isStructSchema()) {
					for (const [memberName, memberSchema] of eventSchema.structIterator()) {
						const { eventHeader, eventPayload } = memberSchema.getMergedTraits();
						if (eventPayload) explicitPayloadMember = memberName;
						else if (eventHeader) {
							const value = event[unionMember][memberName];
							let type = "binary";
							if (memberSchema.isNumericSchema()) {
								if ((-2) ** 31 <= value && value <= 2 ** 31 - 1) type = "integer";
								else type = "long";
							} else if (memberSchema.isTimestampSchema()) type = "timestamp";
							else if (memberSchema.isStringSchema()) type = "string";
							else if (memberSchema.isBooleanSchema()) type = "boolean";
							if (value != null) {
								additionalHeaders[memberName] = {
									type,
									value
								};
								delete event[unionMember][memberName];
							}
						}
					}
					if (explicitPayloadMember !== null) {
						const payloadSchema = eventSchema.getMemberSchema(explicitPayloadMember);
						if (payloadSchema.isBlobSchema()) explicitPayloadContentType = "application/octet-stream";
						else if (payloadSchema.isStringSchema()) explicitPayloadContentType = "text/plain";
						serializer.write(payloadSchema, event[unionMember][explicitPayloadMember]);
					} else serializer.write(eventSchema, event[unionMember]);
				} else if (eventSchema.isUnitSchema()) serializer.write(eventSchema, {});
				else throw new Error("@smithy/core/event-streams - non-struct member not supported in event stream union.");
			}
			const messageSerialization = serializer.flush() ?? /* @__PURE__ */ new Uint8Array();
			return {
				body: typeof messageSerialization === "string" ? (this.serdeContext?.utf8Decoder ?? fromUtf8$1)(messageSerialization) : messageSerialization,
				eventType,
				explicitPayloadContentType,
				additionalHeaders
			};
		}
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/event-streams/index.js
var event_streams_exports = /* @__PURE__ */ __exportAll({
	EventStreamCodec: () => EventStreamCodec,
	EventStreamMarshaller: () => EventStreamMarshaller,
	EventStreamSerde: () => EventStreamSerde,
	HeaderMarshaller: () => HeaderMarshaller,
	Int64: () => Int64$1,
	MessageDecoderStream: () => MessageDecoderStream,
	MessageEncoderStream: () => MessageEncoderStream,
	SmithyMessageDecoderStream: () => SmithyMessageDecoderStream,
	SmithyMessageEncoderStream: () => SmithyMessageEncoderStream,
	UniversalEventStreamMarshaller: () => EventStreamMarshaller$1,
	eventStreamSerdeProvider: () => eventStreamSerdeProvider,
	getChunkedStream: () => getChunkedStream,
	getMessageUnmarshaller: () => getMessageUnmarshaller,
	getUnmarshalledStream: () => getUnmarshalledStream,
	iterableToReadableStream: () => iterableToReadableStream,
	readableStreamToIterable: () => readableStreamToIterable,
	resolveEventStreamSerdeConfig: () => resolveEventStreamSerdeConfig,
	universalEventStreamSerdeProvider: () => eventStreamSerdeProvider$1
});
var init_event_streams = __esmMin((() => {
	init_EventStreamCodec();
	init_HeaderMarshaller();
	init_Int64();
	init_MessageDecoderStream();
	init_MessageEncoderStream();
	init_SmithyMessageDecoderStream();
	init_SmithyMessageEncoderStream();
	init_EventStreamMarshaller();
	init_utils$1();
	init_EventStreamMarshaller$1();
	init_getChunkedStream();
	init_getUnmarshalledStream();
	init_EventStreamSerdeConfig();
	init_EventStreamSerde();
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/protocols/HttpProtocol.js
var HttpProtocol;
var init_HttpProtocol = __esmMin((() => {
	init_transport();
	init_schema();
	init_SerdeContext();
	HttpProtocol = class extends SerdeContext {
		options;
		compositeErrorRegistry;
		constructor(options) {
			super();
			this.options = options;
			this.compositeErrorRegistry = new TypeRegistry(options.defaultNamespace);
			for (const etr of options.errorTypeRegistries ?? []) this.compositeErrorRegistry.copyFrom(etr);
		}
		getRequestType() {
			return HttpRequest;
		}
		getResponseType() {
			return HttpResponse;
		}
		setSerdeContext(serdeContext) {
			this.serdeContext = serdeContext;
			this.serializer.setSerdeContext(serdeContext);
			this.deserializer.setSerdeContext(serdeContext);
			if (this.getPayloadCodec()) this.getPayloadCodec().setSerdeContext(serdeContext);
		}
		updateServiceEndpoint(request, endpoint) {
			if ("url" in endpoint) {
				request.protocol = endpoint.url.protocol;
				request.hostname = endpoint.url.hostname;
				request.port = endpoint.url.port ? Number(endpoint.url.port) : void 0;
				request.path = endpoint.url.pathname;
				request.fragment = endpoint.url.hash || void 0;
				request.username = endpoint.url.username || void 0;
				request.password = endpoint.url.password || void 0;
				if (!request.query) request.query = {};
				for (const [k, v] of endpoint.url.searchParams.entries()) request.query[k] = v;
				if (endpoint.headers) for (const name in endpoint.headers) {
					if (!hasOwn(endpoint.headers, name)) continue;
					request.headers[name] = endpoint.headers[name].join(", ");
				}
				return request;
			} else {
				request.protocol = endpoint.protocol;
				request.hostname = endpoint.hostname;
				request.port = endpoint.port ? Number(endpoint.port) : void 0;
				request.path = endpoint.path;
				request.query = { ...endpoint.query };
				if (endpoint.headers) for (const name in endpoint.headers) {
					if (!hasOwn(endpoint.headers, name)) continue;
					request.headers[name] = endpoint.headers[name];
				}
				return request;
			}
		}
		setHostPrefix(request, operationSchema, input) {
			if (this.serdeContext?.disableHostPrefix) return;
			const inputNs = NormalizedSchema.of(operationSchema.input);
			const opTraits = translateTraits(operationSchema.traits ?? {});
			if (opTraits.endpoint) {
				let hostPrefix = opTraits.endpoint?.[0];
				if (typeof hostPrefix === "string") {
					for (const [name, member] of inputNs.structIterator()) {
						if (!member.getMergedTraits().hostLabel) continue;
						const replacement = input[name];
						if (typeof replacement !== "string") throw new Error(`@smithy/core/schema - ${name} in input must be a string as hostLabel.`);
						hostPrefix = hostPrefix.replace(`{${name}}`, replacement);
					}
					request.hostname = hostPrefix + request.hostname;
					if (!isValidHostname(request.hostname)) throw new Error(`[${request.hostname}] is not a valid hostname.`);
				}
			}
		}
		deserializeMetadata(output) {
			return {
				httpStatusCode: output.statusCode,
				requestId: output.headers["x-amzn-requestid"] ?? output.headers["x-amzn-request-id"] ?? output.headers["x-amz-request-id"],
				extendedRequestId: output.headers["x-amz-id-2"],
				cfId: output.headers["x-amz-cf-id"]
			};
		}
		resolveError(name, namespaces, registries) {
			const defaultErrorSchema = [
				-3,
				"",
				"Error",
				0,
				[],
				[],
				0
			];
			let schema;
			for (const registry of registries) for (const ns of namespaces) try {
				if (ns === "*") schema = registry.getSchema(name);
				else schema = registry.getSchema(ns + "#" + name);
				const errorCtor = registry.getErrorCtor(schema);
				if (errorCtor) return [
					schema,
					errorCtor,
					"modeled"
				];
				else {
					const syntheticErrorSchema = registry.getBaseException();
					if (syntheticErrorSchema) {
						const syntheticErrorCtor = registry.getErrorCtor(syntheticErrorSchema);
						if (syntheticErrorCtor) return [
							schema,
							syntheticErrorCtor,
							"synthetic"
						];
					}
				}
			} catch (ignored) {}
			for (const registry of registries) {
				const syntheticErrorSchema = registry.getBaseException();
				if (syntheticErrorSchema) {
					const syntheticErrorCtor = registry.getErrorCtor(syntheticErrorSchema);
					if (syntheticErrorCtor) return [
						syntheticErrorSchema,
						syntheticErrorCtor,
						"synthetic"
					];
				}
			}
			return [
				defaultErrorSchema,
				Error,
				"native"
			];
		}
		async serializeEventStream({ eventStream, requestSchema, initialRequest }) {
			return (await this.loadEventStreamCapability()).serializeEventStream({
				eventStream,
				requestSchema,
				initialRequest
			});
		}
		async deserializeEventStream({ response, responseSchema, initialResponseContainer }) {
			return (await this.loadEventStreamCapability()).deserializeEventStream({
				response,
				responseSchema,
				initialResponseContainer
			});
		}
		async loadEventStreamCapability() {
			const { EventStreamSerde, eventStreamSerdeProvider } = await Promise.resolve().then(() => (init_event_streams(), event_streams_exports));
			return new EventStreamSerde({
				marshaller: this.resolveEventStreamMarshaller(eventStreamSerdeProvider),
				serializer: this.serializer,
				deserializer: this.deserializer,
				serdeContext: this.serdeContext,
				defaultContentType: this.getDefaultContentType(),
				compositeErrorRegistry: this.compositeErrorRegistry
			});
		}
		getDefaultContentType() {
			throw new Error(`@smithy/core/protocols - ${this.constructor.name} getDefaultContentType() implementation missing.`);
		}
		async deserializeHttpMessage(schema, context, response, arg4, arg5) {
			return [];
		}
		getEventStreamMarshaller() {
			const context = this.serdeContext;
			if (!context.eventStreamMarshaller) throw new Error("@smithy/core - HttpProtocol: eventStreamMarshaller missing in serdeContext.");
			return context.eventStreamMarshaller;
		}
		resolveEventStreamMarshaller(importedProvider) {
			const context = this.serdeContext;
			if (context.eventStreamMarshaller) return context.eventStreamMarshaller;
			return importedProvider(this.serdeContext);
		}
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/protocols/HttpBindingProtocol.js
var HttpBindingProtocol;
var init_HttpBindingProtocol = __esmMin((() => {
	init_transport();
	init_schema();
	init_serde();
	init_HttpProtocol();
	init_collect_stream_body();
	init_extended_encode_uri_component();
	HttpBindingProtocol = class extends HttpProtocol {
		async serializeRequest(operationSchema, _input, context) {
			const input = _input && typeof _input === "object" ? _input : {};
			const serializer = this.serializer;
			const query = {};
			const headers = {};
			const endpoint = await context.endpoint();
			const ns = NormalizedSchema.of(operationSchema?.input);
			const payloadMemberNames = [];
			const payloadMemberSchemas = [];
			let hasNonHttpBindingMember = false;
			let payload;
			const request = new HttpRequest({
				protocol: "",
				hostname: "",
				port: void 0,
				path: "",
				fragment: void 0,
				query,
				headers,
				body: void 0
			});
			if (endpoint) {
				this.updateServiceEndpoint(request, endpoint);
				this.setHostPrefix(request, operationSchema, input);
				const opTraits = translateTraits(operationSchema.traits);
				if (opTraits.http) {
					request.method = opTraits.http[0];
					const [path, search] = opTraits.http[1].split("?");
					if (request.path == "/") request.path = path;
					else request.path += path;
					const traitSearchParams = new URLSearchParams(search ?? "");
					for (const [key, value] of traitSearchParams) query[key] = value;
				}
			}
			for (const [memberName, memberNs] of ns.structIterator()) {
				const memberTraits = memberNs.getMergedTraits() ?? {};
				const inputMemberValue = input[memberName];
				if (inputMemberValue == null && !memberNs.isIdempotencyToken()) {
					if (memberTraits.httpLabel) {
						if (request.path.includes(`{${memberName}+}`) || request.path.includes(`{${memberName}}`)) throw new Error(`No value provided for input HTTP label: ${memberName}.`);
					}
					continue;
				}
				if (memberTraits.httpPayload) {
					if (memberNs.isStreaming()) {
						if (memberNs.isStructSchema()) {
							if (input[memberName]) payload = await this.serializeEventStream({
								eventStream: input[memberName],
								requestSchema: ns
							});
						} else payload = inputMemberValue;
					} else {
						serializer.write(memberNs, inputMemberValue);
						payload = serializer.flush();
					}
				} else if (memberTraits.httpLabel) {
					serializer.write(memberNs, inputMemberValue);
					const replacement = serializer.flush();
					if (request.path.includes(`{${memberName}+}`)) request.path = request.path.replace(`{${memberName}+}`, replacement.split("/").map(extendedEncodeURIComponent).join("/"));
					else if (request.path.includes(`{${memberName}}`)) request.path = request.path.replace(`{${memberName}}`, extendedEncodeURIComponent(replacement));
				} else if (memberTraits.httpHeader) {
					serializer.write(memberNs, inputMemberValue);
					headers[memberTraits.httpHeader.toLowerCase()] = String(serializer.flush());
				} else if (typeof memberTraits.httpPrefixHeaders === "string") for (const key in inputMemberValue) {
					if (!hasOwn(inputMemberValue, key)) continue;
					const val = inputMemberValue[key];
					const amalgam = memberTraits.httpPrefixHeaders + key;
					serializer.write([memberNs.getValueSchema(), { httpHeader: amalgam }], val);
					headers[amalgam.toLowerCase()] = serializer.flush();
				}
				else if (memberTraits.httpQuery || memberTraits.httpQueryParams) this.serializeQuery(memberNs, inputMemberValue, query);
				else {
					hasNonHttpBindingMember = true;
					payloadMemberNames.push(memberName);
					payloadMemberSchemas.push(memberNs);
				}
			}
			if (hasNonHttpBindingMember && input) {
				const [namespace, name] = (ns.getName(true) ?? "#Unknown").split("#");
				const requiredMembers = ns.getSchema()[6];
				const payloadSchema = [
					3,
					namespace,
					name,
					ns.getMergedTraits(),
					payloadMemberNames,
					payloadMemberSchemas,
					void 0
				];
				if (requiredMembers) payloadSchema[6] = requiredMembers;
				else payloadSchema.pop();
				serializer.write(payloadSchema, input);
				payload = serializer.flush();
			}
			request.headers = headers;
			request.query = query;
			request.body = payload;
			return request;
		}
		serializeQuery(ns, data, query) {
			const serializer = this.serializer;
			const traits = ns.getMergedTraits();
			if (traits.httpQueryParams) {
				for (const key in data) {
					if (!hasOwn(data, key)) continue;
					if (!(key in query)) {
						const val = data[key];
						const valueSchema = ns.getValueSchema();
						Object.assign(valueSchema.getMergedTraits(), {
							...traits,
							httpQuery: key,
							httpQueryParams: void 0
						});
						this.serializeQuery(valueSchema, val, query);
					}
				}
				return;
			}
			if (ns.isListSchema()) {
				const sparse = !!ns.getMergedTraits().sparse;
				const buffer = [];
				for (const item of data) {
					serializer.write([ns.getValueSchema(), traits], item);
					const serializable = serializer.flush();
					if (sparse || serializable !== void 0) buffer.push(serializable);
				}
				query[traits.httpQuery] = buffer;
			} else {
				serializer.write([ns, traits], data);
				query[traits.httpQuery] = serializer.flush();
			}
		}
		async deserializeResponse(operationSchema, context, response) {
			const deserializer = this.deserializer;
			const ns = NormalizedSchema.of(operationSchema.output);
			const dataObject = {};
			if (response.statusCode >= 300) {
				const bytes = await collectBody$1(response.body, context);
				if (bytes.byteLength > 0) Object.assign(dataObject, await deserializer.read(15, bytes));
				await this.handleError(operationSchema, context, response, dataObject, this.deserializeMetadata(response));
				throw new Error("@smithy/core/protocols - HTTP Protocol error handler failed to throw.");
			}
			for (const header in response.headers) {
				if (!hasOwn(response.headers, header)) continue;
				const value = response.headers[header];
				delete response.headers[header];
				response.headers[header.toLowerCase()] = value;
			}
			const nonHttpBindingMembers = await this.deserializeHttpMessage(ns, context, response, dataObject);
			if (nonHttpBindingMembers.length) {
				const bytes = await collectBody$1(response.body, context);
				if (bytes.byteLength > 0) {
					const dataFromBody = await deserializer.read(ns, bytes);
					for (const member of nonHttpBindingMembers) if (dataFromBody[member] != null) dataObject[member] = dataFromBody[member];
				}
			} else if (nonHttpBindingMembers.discardResponseBody) await collectBody$1(response.body, context);
			dataObject.$metadata = this.deserializeMetadata(response);
			return dataObject;
		}
		async deserializeHttpMessage(schema, context, response, arg4, arg5) {
			let dataObject;
			if (arg4 instanceof Set) dataObject = arg5;
			else dataObject = arg4;
			let discardResponseBody = true;
			const deserializer = this.deserializer;
			const ns = NormalizedSchema.of(schema);
			const nonHttpBindingMembers = [];
			for (const [memberName, memberSchema] of ns.structIterator()) {
				const memberTraits = memberSchema.getMemberTraits();
				if (memberTraits.httpPayload) {
					discardResponseBody = false;
					if (memberSchema.isStreaming()) {
						if (memberSchema.isStructSchema()) dataObject[memberName] = await this.deserializeEventStream({
							response,
							responseSchema: ns
						});
						else dataObject[memberName] = sdkStreamMixin(response.body);
					} else if (response.body) {
						const bytes = await collectBody$1(response.body, context);
						if (bytes.byteLength > 0) dataObject[memberName] = await deserializer.read(memberSchema, bytes);
					}
				} else if (memberTraits.httpHeader) {
					const key = String(memberTraits.httpHeader).toLowerCase();
					const value = response.headers[key];
					if (null != value) {
						if (memberSchema.isListSchema()) {
							const headerListValueSchema = memberSchema.getValueSchema();
							headerListValueSchema.getMergedTraits().httpHeader = key;
							let sections;
							if (headerListValueSchema.isTimestampSchema() && headerListValueSchema.getSchema() === 4) sections = splitEvery(value, ",", 2);
							else sections = splitHeader(value);
							const list = [];
							for (const section of sections) list.push(await deserializer.read(headerListValueSchema, section.trim()));
							dataObject[memberName] = list;
						} else dataObject[memberName] = await deserializer.read(memberSchema, value);
					}
				} else if (memberTraits.httpPrefixHeaders !== void 0) {
					dataObject[memberName] = {};
					for (const header in response.headers) {
						if (!hasOwn(response.headers, header)) continue;
						if (header.startsWith(memberTraits.httpPrefixHeaders)) {
							const value = response.headers[header];
							const valueSchema = memberSchema.getValueSchema();
							valueSchema.getMergedTraits().httpHeader = header;
							dataObject[memberName][header.slice(memberTraits.httpPrefixHeaders.length)] = await deserializer.read(valueSchema, value);
						}
					}
				} else if (memberTraits.httpResponseCode) dataObject[memberName] = response.statusCode;
				else nonHttpBindingMembers.push(memberName);
			}
			nonHttpBindingMembers.discardResponseBody = discardResponseBody;
			return nonHttpBindingMembers;
		}
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/protocols/RpcProtocol.js
var RpcProtocol;
var init_RpcProtocol = __esmMin((() => {
	init_transport();
	init_schema();
	init_HttpProtocol();
	init_collect_stream_body();
	RpcProtocol = class extends HttpProtocol {
		async serializeRequest(operationSchema, _input, context) {
			const serializer = this.serializer;
			const query = {};
			const headers = {};
			const endpoint = await context.endpoint();
			const ns = NormalizedSchema.of(operationSchema?.input);
			const schema = ns.getSchema();
			let payload;
			const input = _input && typeof _input === "object" ? _input : {};
			const request = new HttpRequest({
				protocol: "",
				hostname: "",
				port: void 0,
				path: "/",
				fragment: void 0,
				query,
				headers,
				body: void 0
			});
			if (endpoint) {
				this.updateServiceEndpoint(request, endpoint);
				this.setHostPrefix(request, operationSchema, input);
			}
			if (input) {
				const eventStreamMember = ns.getEventStreamMember();
				if (eventStreamMember) {
					if (input[eventStreamMember]) {
						const initialRequest = {};
						for (const [memberName] of ns.structIterator()) if (memberName !== eventStreamMember && input[memberName] != null) initialRequest[memberName] = input[memberName];
						payload = await this.serializeEventStream({
							eventStream: input[eventStreamMember],
							requestSchema: ns,
							initialRequest
						});
					}
				} else {
					serializer.write(schema, input);
					payload = serializer.flush();
				}
			}
			request.headers = Object.assign(request.headers, headers);
			request.query = query;
			request.body = payload;
			request.method = "POST";
			return request;
		}
		async deserializeResponse(operationSchema, context, response) {
			const deserializer = this.deserializer;
			const ns = NormalizedSchema.of(operationSchema.output);
			const dataObject = {};
			if (response.statusCode >= 300) {
				const bytes = await collectBody$1(response.body, context);
				if (bytes.byteLength > 0) Object.assign(dataObject, await deserializer.read(15, bytes));
				await this.handleError(operationSchema, context, response, dataObject, this.deserializeMetadata(response));
				throw new Error("@smithy/core/protocols - RPC Protocol error handler failed to throw.");
			}
			for (const header in response.headers) {
				if (!hasOwn(response.headers, header)) continue;
				const value = response.headers[header];
				delete response.headers[header];
				response.headers[header.toLowerCase()] = value;
			}
			const eventStreamMember = ns.getEventStreamMember();
			if (eventStreamMember) dataObject[eventStreamMember] = await this.deserializeEventStream({
				response,
				responseSchema: ns,
				initialResponseContainer: dataObject
			});
			else {
				const bytes = await collectBody$1(response.body, context);
				if (bytes.byteLength > 0) Object.assign(dataObject, await deserializer.read(ns, bytes));
			}
			dataObject.$metadata = this.deserializeMetadata(response);
			return dataObject;
		}
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/protocols/serde/determineTimestampFormat.js
function determineTimestampFormat(ns, settings) {
	if (settings.timestampFormat.useTrait) {
		if (ns.isTimestampSchema() && (ns.getSchema() === 5 || ns.getSchema() === 6 || ns.getSchema() === 7)) return ns.getSchema();
	}
	const { httpLabel, httpPrefixHeaders, httpHeader, httpQuery } = ns.getMergedTraits();
	return (settings.httpBindings ? typeof httpPrefixHeaders === "string" || Boolean(httpHeader) ? 6 : Boolean(httpQuery) || Boolean(httpLabel) ? 5 : void 0 : void 0) ?? settings.timestampFormat.default;
}
var init_determineTimestampFormat = __esmMin((() => {}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/protocols/serde/FromStringShapeDeserializer.js
var FromStringShapeDeserializer;
var init_FromStringShapeDeserializer = __esmMin((() => {
	init_schema();
	init_serde();
	init_SerdeContext();
	init_determineTimestampFormat();
	FromStringShapeDeserializer = class extends SerdeContext {
		settings;
		constructor(settings) {
			super();
			this.settings = settings;
		}
		read(_schema, data) {
			const ns = NormalizedSchema.of(_schema);
			if (ns.isListSchema()) return splitHeader(data).map((item) => this.read(ns.getValueSchema(), item));
			if (ns.isBlobSchema()) return (this.serdeContext?.base64Decoder ?? fromBase64)(data);
			if (ns.isTimestampSchema()) switch (determineTimestampFormat(ns, this.settings)) {
				case 5: return _parseRfc3339DateTimeWithOffset(data);
				case 6: return _parseRfc7231DateTime(data);
				case 7: return _parseEpochTimestamp(data);
				default:
					console.warn("Missing timestamp format, parsing value with Date constructor:", data);
					return new Date(data);
			}
			if (ns.isStringSchema()) {
				const mediaType = ns.getMergedTraits().mediaType;
				let intermediateValue = data;
				if (mediaType) {
					if (ns.getMergedTraits().httpHeader) intermediateValue = this.base64ToUtf8(intermediateValue);
					if (mediaType === "application/json" || mediaType.endsWith("+json")) intermediateValue = LazyJsonString.from(intermediateValue);
					return intermediateValue;
				}
			}
			if (ns.isNumericSchema()) return Number(data);
			if (ns.isBigIntegerSchema()) return BigInt(data);
			if (ns.isBigDecimalSchema()) return new NumericValue(data, "bigDecimal");
			if (ns.isBooleanSchema()) return String(data).toLowerCase() === "true";
			return data;
		}
		base64ToUtf8(base64String) {
			return (this.serdeContext?.utf8Encoder ?? toUtf8$1)((this.serdeContext?.base64Decoder ?? fromBase64)(base64String));
		}
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/protocols/serde/HttpInterceptingShapeDeserializer.js
var HttpInterceptingShapeDeserializer;
var init_HttpInterceptingShapeDeserializer = __esmMin((() => {
	init_schema();
	init_serde();
	init_SerdeContext();
	init_FromStringShapeDeserializer();
	HttpInterceptingShapeDeserializer = class extends SerdeContext {
		codecDeserializer;
		stringDeserializer;
		constructor(codecDeserializer, codecSettings) {
			super();
			this.codecDeserializer = codecDeserializer;
			this.stringDeserializer = new FromStringShapeDeserializer(codecSettings);
		}
		setSerdeContext(serdeContext) {
			this.stringDeserializer.setSerdeContext(serdeContext);
			this.codecDeserializer.setSerdeContext(serdeContext);
			this.serdeContext = serdeContext;
		}
		read(schema, data) {
			const ns = NormalizedSchema.of(schema);
			const traits = ns.getMergedTraits();
			const toString = this.serdeContext?.utf8Encoder ?? toUtf8$1;
			if (traits.httpHeader || traits.httpResponseCode) return this.stringDeserializer.read(ns, toString(data));
			if (traits.httpPayload) {
				if (ns.isBlobSchema()) {
					const toBytes = this.serdeContext?.utf8Decoder ?? fromUtf8$1;
					if (typeof data === "string") return toBytes(data);
					return data;
				} else if (ns.isStringSchema()) {
					if ("byteLength" in data) return toString(data);
					return data;
				}
			}
			return this.codecDeserializer.read(ns, data);
		}
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/protocols/serde/ToStringShapeSerializer.js
var ToStringShapeSerializer;
var init_ToStringShapeSerializer = __esmMin((() => {
	init_schema();
	init_serde();
	init_SerdeContext();
	init_determineTimestampFormat();
	ToStringShapeSerializer = class extends SerdeContext {
		settings;
		stringBuffer = "";
		constructor(settings) {
			super();
			this.settings = settings;
		}
		write(schema, value) {
			const ns = NormalizedSchema.of(schema);
			switch (typeof value) {
				case "object":
					if (value === null) {
						this.stringBuffer = "null";
						return;
					}
					if (ns.isTimestampSchema()) {
						if (!(value instanceof Date)) throw new Error(`@smithy/core/protocols - received non-Date value ${value} when schema expected Date in ${ns.getName(true)}`);
						switch (determineTimestampFormat(ns, this.settings)) {
							case 5:
								this.stringBuffer = value.toISOString().replace(".000Z", "Z");
								break;
							case 6:
								this.stringBuffer = dateToUtcString(value);
								break;
							case 7:
								this.stringBuffer = String(value.getTime() / 1e3);
								break;
							default:
								console.warn("Missing timestamp format, using epoch seconds", value);
								this.stringBuffer = String(value.getTime() / 1e3);
						}
						return;
					}
					if (ns.isBlobSchema() && "byteLength" in value) {
						this.stringBuffer = (this.serdeContext?.base64Encoder ?? toBase64$1)(value);
						return;
					}
					if (ns.isListSchema() && Array.isArray(value)) {
						let buffer = "";
						for (const item of value) {
							this.write([ns.getValueSchema(), ns.getMergedTraits()], item);
							const headerItem = this.flush();
							const serialized = ns.getValueSchema().isTimestampSchema() ? headerItem : quoteHeader(headerItem);
							if (buffer !== "") buffer += ", ";
							buffer += serialized;
						}
						this.stringBuffer = buffer;
						return;
					}
					this.stringBuffer = JSON.stringify(value, null, 2);
					break;
				case "string":
					const mediaType = ns.getMergedTraits().mediaType;
					let intermediateValue = value;
					if (mediaType) {
						if (mediaType === "application/json" || mediaType.endsWith("+json")) intermediateValue = LazyJsonString.from(intermediateValue);
						if (ns.getMergedTraits().httpHeader) {
							this.stringBuffer = (this.serdeContext?.base64Encoder ?? toBase64$1)(intermediateValue.toString());
							return;
						}
					}
					this.stringBuffer = value;
					break;
				default: if (ns.isIdempotencyToken()) this.stringBuffer = generateIdempotencyToken();
				else this.stringBuffer = String(value);
			}
		}
		flush() {
			const buffer = this.stringBuffer;
			this.stringBuffer = "";
			return buffer;
		}
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/protocols/serde/HttpInterceptingShapeSerializer.js
var HttpInterceptingShapeSerializer;
var init_HttpInterceptingShapeSerializer = __esmMin((() => {
	init_schema();
	init_ToStringShapeSerializer();
	HttpInterceptingShapeSerializer = class {
		codecSerializer;
		stringSerializer;
		buffer;
		constructor(codecSerializer, codecSettings, stringSerializer = new ToStringShapeSerializer(codecSettings)) {
			this.codecSerializer = codecSerializer;
			this.stringSerializer = stringSerializer;
		}
		setSerdeContext(serdeContext) {
			this.codecSerializer.setSerdeContext(serdeContext);
			this.stringSerializer.setSerdeContext(serdeContext);
		}
		write(schema, value) {
			const ns = NormalizedSchema.of(schema);
			const traits = ns.getMergedTraits();
			if (traits.httpHeader || traits.httpLabel || traits.httpQuery) {
				this.stringSerializer.write(ns, value);
				this.buffer = this.stringSerializer.flush();
				return;
			}
			return this.codecSerializer.write(ns, value);
		}
		flush() {
			if (this.buffer !== void 0) {
				const buffer = this.buffer;
				this.buffer = void 0;
				return buffer;
			}
			return this.codecSerializer.flush();
		}
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/protocols/protocol-http/extensions/httpExtensionConfiguration.js
var getHttpHandlerExtensionConfiguration, resolveHttpHandlerRuntimeConfig;
var init_httpExtensionConfiguration = __esmMin((() => {
	getHttpHandlerExtensionConfiguration = (runtimeConfig) => {
		if (runtimeConfig.logger && runtimeConfig.logger.constructor?.name !== "NoOpLogger") runtimeConfig.requestHandler?.updateHttpClientConfig?.(Symbol.for("logger"), runtimeConfig.logger);
		return {
			setHttpHandler(handler) {
				runtimeConfig.requestHandler = handler;
			},
			httpHandler() {
				return runtimeConfig.requestHandler;
			},
			updateHttpClientConfig(key, value) {
				runtimeConfig.requestHandler?.updateHttpClientConfig(key, value);
			},
			httpHandlerConfigs() {
				return runtimeConfig.requestHandler.httpHandlerConfigs();
			}
		};
	};
	resolveHttpHandlerRuntimeConfig = (httpHandlerExtensionConfiguration) => {
		return { requestHandler: httpHandlerExtensionConfiguration.httpHandler() };
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/protocols/middleware-content-length/contentLengthMiddleware.js
function contentLengthMiddleware(bodyLengthChecker) {
	return (next) => async (args) => {
		const request = args.request;
		if (HttpRequest.isInstance(request)) {
			const { body, headers } = request;
			if (body && Object.keys(headers).map((str) => str.toLowerCase()).indexOf(CONTENT_LENGTH_HEADER$1) === -1) try {
				const length = bodyLengthChecker(body);
				if (length != null) request.headers = {
					...request.headers,
					[CONTENT_LENGTH_HEADER$1]: String(length)
				};
			} catch (ignored) {}
		}
		return next({
			...args,
			request
		});
	};
}
var CONTENT_LENGTH_HEADER$1, contentLengthMiddlewareOptions, getContentLengthPlugin;
var init_contentLengthMiddleware = __esmMin((() => {
	init_transport();
	CONTENT_LENGTH_HEADER$1 = "content-length";
	contentLengthMiddlewareOptions = {
		step: "build",
		tags: ["SET_CONTENT_LENGTH", "CONTENT_LENGTH"],
		name: "contentLengthMiddleware",
		override: true
	};
	getContentLengthPlugin = (options) => ({ applyToStack: (clientStack) => {
		clientStack.add(contentLengthMiddleware(options.bodyLengthChecker), contentLengthMiddlewareOptions);
	} });
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/protocols/util-uri-escape/escape-uri.js
var escapeUri, hexEncode;
var init_escape_uri = __esmMin((() => {
	escapeUri = (uri) => encodeURIComponent(uri).replace(/[!'()*]/g, hexEncode);
	hexEncode = (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`;
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/protocols/querystring-builder/buildQueryString.js
function buildQueryString(query) {
	const parts = [];
	for (let key of Object.keys(query).sort()) {
		const value = query[key];
		key = escapeUri(key);
		if (Array.isArray(value)) for (let i = 0, iLen = value.length; i < iLen; i++) parts.push(`${key}=${escapeUri(value[i])}`);
		else {
			let qsEntry = key;
			if (value || typeof value === "string") qsEntry += `=${escapeUri(value)}`;
			parts.push(qsEntry);
		}
	}
	return parts.join("&");
}
var init_buildQueryString = __esmMin((() => {
	init_escape_uri();
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/protocols/index.js
var init_protocols$1 = __esmMin((() => {
	init_collect_stream_body();
	init_extended_encode_uri_component();
	init_HttpBindingProtocol();
	init_HttpProtocol();
	init_RpcProtocol();
	init_transport();
	init_FromStringShapeDeserializer();
	init_HttpInterceptingShapeDeserializer();
	init_HttpInterceptingShapeSerializer();
	init_ToStringShapeSerializer();
	init_determineTimestampFormat();
	init_SerdeContext();
	init_dist_es$14();
	init_httpExtensionConfiguration();
	init_contentLengthMiddleware();
	init_escape_uri();
	init_buildQueryString();
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/retry/service-error-classification/constants.js
var THROTTLING_ERROR_CODES, TRANSIENT_ERROR_CODES, TRANSIENT_ERROR_STATUS_CODES, NODEJS_TIMEOUT_ERROR_CODES$1, NODEJS_NETWORK_ERROR_CODES;
var init_constants$5 = __esmMin((() => {
	THROTTLING_ERROR_CODES = [
		"BandwidthLimitExceeded",
		"EC2ThrottledException",
		"LimitExceededException",
		"PriorRequestNotComplete",
		"ProvisionedThroughputExceededException",
		"RequestLimitExceeded",
		"RequestThrottled",
		"RequestThrottledException",
		"SlowDown",
		"ThrottledException",
		"Throttling",
		"ThrottlingException",
		"TooManyRequestsException",
		"TransactionInProgressException"
	];
	TRANSIENT_ERROR_CODES = [
		"TimeoutError",
		"RequestTimeout",
		"RequestTimeoutException"
	];
	TRANSIENT_ERROR_STATUS_CODES = [
		500,
		502,
		503,
		504
	];
	NODEJS_TIMEOUT_ERROR_CODES$1 = [
		"ECONNRESET",
		"ECONNREFUSED",
		"EPIPE",
		"ETIMEDOUT"
	];
	NODEJS_NETWORK_ERROR_CODES = [
		"EHOSTUNREACH",
		"ENETUNREACH",
		"ENOTFOUND",
		"EAI_AGAIN"
	];
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/retry/service-error-classification/service-error-classification.js
function isNodeJsHttp2TransientError(error) {
	return error.code === "ERR_HTTP2_STREAM_ERROR" && error.message.includes("NGHTTP2_REFUSED_STREAM");
}
var isRetryableByTrait, isClockSkewCorrectedError, isBrowserNetworkError, isThrottlingError, isTransientError, isServerError;
var init_service_error_classification = __esmMin((() => {
	init_constants$5();
	isRetryableByTrait = (error) => error?.$retryable !== void 0;
	isClockSkewCorrectedError = (error) => error.$metadata?.clockSkewCorrected;
	isBrowserNetworkError = (error) => {
		const errorMessages = /* @__PURE__ */ new Set([
			"Failed to fetch",
			"NetworkError when attempting to fetch resource",
			"The Internet connection appears to be offline",
			"Load failed",
			"Network request failed"
		]);
		if (!(error && error instanceof TypeError)) return false;
		return errorMessages.has(error.message);
	};
	isThrottlingError = (error) => error.$metadata?.httpStatusCode === 429 || THROTTLING_ERROR_CODES.includes(error.name) || error.$retryable?.throttling == true;
	isTransientError = (error, depth = 0) => error?.name !== "AbortError" && (isRetryableByTrait(error) || isClockSkewCorrectedError(error) || error.name === "InvalidSignatureException" && error.message?.includes("Signature expired") || TRANSIENT_ERROR_CODES.includes(error.name) || NODEJS_TIMEOUT_ERROR_CODES$1.includes(error?.code || "") || NODEJS_NETWORK_ERROR_CODES.includes(error?.code || "") || TRANSIENT_ERROR_STATUS_CODES.includes(error.$metadata?.httpStatusCode || 0) || isBrowserNetworkError(error) || isNodeJsHttp2TransientError(error) || error.cause !== void 0 && depth <= 10 && isTransientError(error.cause, depth + 1));
	isServerError = (error) => {
		if (error.$metadata?.httpStatusCode !== void 0) {
			const statusCode = error.$metadata.httpStatusCode;
			if (500 <= statusCode && statusCode <= 599 && !isTransientError(error)) return true;
			return false;
		}
		return false;
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/retry/util-retry/constants.js
var MAXIMUM_RETRY_DELAY, INVOCATION_ID_HEADER, REQUEST_HEADER;
var init_constants$4 = __esmMin((() => {
	MAXIMUM_RETRY_DELAY = 2e4;
	INVOCATION_ID_HEADER = "amz-sdk-invocation-id";
	REQUEST_HEADER = "amz-sdk-request";
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/retry/middleware-retry/parseRetryAfterHeader.js
function parseRetryAfterHeader(response, logger) {
	if (!HttpResponse.isInstance(response)) return;
	for (const header in response.headers) {
		if (!hasOwn(response.headers, header)) continue;
		const h = header.toLowerCase();
		if (h === "retry-after") {
			const retryAfter = response.headers[header];
			let retryAfterSeconds = NaN;
			if (retryAfter.endsWith("GMT")) try {
				retryAfterSeconds = (parseRfc7231DateTime(retryAfter).getTime() - Date.now()) / 1e3;
			} catch (e) {
				logger?.trace?.("Failed to parse retry-after header");
				logger?.trace?.(e);
			}
			else if (retryAfter.match(/ GMT, ((\d+)|(\d+\.\d+))$/)) retryAfterSeconds = Number(retryAfter.match(/ GMT, ([\d.]+)$/)?.[1]);
			else if (retryAfter.match(/^((\d+)|(\d+\.\d+))$/)) retryAfterSeconds = Number(retryAfter);
			else if (Date.parse(retryAfter) >= Date.now()) retryAfterSeconds = (Date.parse(retryAfter) - Date.now()) / 1e3;
			if (isNaN(retryAfterSeconds)) return;
			return new Date(Date.now() + retryAfterSeconds * 1e3);
		} else if (h === "x-amz-retry-after") {
			const v = response.headers[header];
			const backoffMilliseconds = Number(v);
			if (isNaN(backoffMilliseconds)) {
				logger?.trace?.(`Failed to parse x-amz-retry-after=${v}`);
				return;
			}
			return new Date(Date.now() + backoffMilliseconds);
		}
	}
}
var init_parseRetryAfterHeader = __esmMin((() => {
	init_transport();
	init_protocols$1();
	init_serde();
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/retry/middleware-retry/util.js
var asSdkError;
var init_util = __esmMin((() => {
	asSdkError = (error) => {
		if (error instanceof Error) return error;
		if (error instanceof Object) return Object.assign(/* @__PURE__ */ new Error(), error);
		if (typeof error === "string") return new Error(error);
		return /* @__PURE__ */ new Error(`AWS SDK error wrapper for ${error}`);
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/retry/middleware-retry/retryMiddleware.js
function bindRetryMiddleware(isStreamingPayload) {
	return (options) => (next, context) => async (args) => {
		let retryStrategy = await options.retryStrategy();
		const maxAttempts = await options.maxAttempts();
		if (isRetryStrategyV2(retryStrategy)) {
			retryStrategy = retryStrategy;
			let retryToken = await retryStrategy.acquireInitialRetryToken((context["partition_id"] ?? "") + (context.__retryLongPoll ? ":longpoll" : ""));
			let lastError = /* @__PURE__ */ new Error();
			let attempts = 0;
			let totalRetryDelay = 0;
			const { request } = args;
			const isRequest = HttpRequest.isInstance(request);
			if (isRequest) request.headers[INVOCATION_ID_HEADER] = v4();
			while (true) try {
				if (isRequest) request.headers[REQUEST_HEADER] = `attempt=${attempts + 1}; max=${maxAttempts}`;
				const { response, output } = await next(args);
				retryStrategy.recordSuccess(retryToken);
				output.$metadata.attempts = attempts + 1;
				output.$metadata.totalRetryDelay = totalRetryDelay;
				return {
					response,
					output
				};
			} catch (e) {
				const retryErrorInfo = getRetryErrorInfo(e, options.logger);
				lastError = asSdkError(e);
				if (isRequest && isStreamingPayload(request)) {
					(context.logger instanceof NoOpLogger ? console : context.logger)?.warn("An error was encountered in a non-retryable streaming request.");
					throw lastError;
				}
				try {
					retryToken = await retryStrategy.refreshRetryTokenForRetry(retryToken, retryErrorInfo);
				} catch (ignoredRefreshError) {
					if (!lastError.$metadata) lastError.$metadata = {};
					lastError.$metadata.attempts = attempts + 1;
					lastError.$metadata.totalRetryDelay = totalRetryDelay;
					throw lastError;
				}
				attempts = retryToken.getRetryCount();
				const delay = retryToken.getRetryDelay();
				totalRetryDelay += (retryToken?.$retryLog?.acquisitionDelay ?? 0) + delay;
				if (delay > 0) await cooldown(delay);
			}
		} else {
			retryStrategy = retryStrategy;
			if (retryStrategy?.mode) context.userAgent = [...context.userAgent || [], ["cfg/retry-mode", retryStrategy.mode]];
			return retryStrategy.retry(next, args);
		}
	};
}
function bindGetRetryPlugin(isStreamingPayload) {
	const retryMiddleware = bindRetryMiddleware(isStreamingPayload);
	return (options) => ({ applyToStack: (clientStack) => {
		clientStack.add(retryMiddleware(options), retryMiddlewareOptions);
	} });
}
var cooldown, isRetryStrategyV2, getRetryErrorInfo, getRetryErrorType, retryMiddlewareOptions;
var init_retryMiddleware = __esmMin((() => {
	init_client$1();
	init_protocols$1();
	init_serde();
	init_service_error_classification();
	init_constants$4();
	init_parseRetryAfterHeader();
	init_util();
	cooldown = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
	isRetryStrategyV2 = (retryStrategy) => typeof retryStrategy.acquireInitialRetryToken !== "undefined" && typeof retryStrategy.refreshRetryTokenForRetry !== "undefined" && typeof retryStrategy.recordSuccess !== "undefined";
	getRetryErrorInfo = (error, logger) => {
		const errorInfo = {
			error,
			errorType: getRetryErrorType(error)
		};
		const retryAfterHint = parseRetryAfterHeader(error.$response, logger);
		if (retryAfterHint) errorInfo.retryAfterHint = retryAfterHint;
		return errorInfo;
	};
	getRetryErrorType = (error) => {
		if (isThrottlingError(error)) return "THROTTLING";
		if (isTransientError(error)) return "TRANSIENT";
		if (isServerError(error)) return "SERVER_ERROR";
		return "CLIENT_ERROR";
	};
	retryMiddlewareOptions = {
		name: "retryMiddleware",
		tags: ["RETRY"],
		step: "finalizeRequest",
		priority: "high",
		override: true
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/retry/util-retry/DefaultRateLimiter.js
var DefaultRateLimiter;
var init_DefaultRateLimiter = __esmMin((() => {
	init_service_error_classification();
	DefaultRateLimiter = class DefaultRateLimiter {
		static setTimeoutFn = (fn, delay) => setTimeout(fn, delay);
		beta;
		minCapacity;
		minFillRate;
		scaleConstant;
		smooth;
		enabled = false;
		availableTokens = 0;
		lastMaxRate = 0;
		measuredTxRate = 0;
		requestCount = 0;
		fillRate;
		lastThrottleTime;
		lastTimestamp = 0;
		lastTxRateBucket;
		maxCapacity;
		timeWindow = 0;
		constructor(options) {
			this.beta = options?.beta ?? .7;
			this.minCapacity = options?.minCapacity ?? 1;
			this.minFillRate = options?.minFillRate ?? .5;
			this.scaleConstant = options?.scaleConstant ?? .4;
			this.smooth = options?.smooth ?? .8;
			this.lastThrottleTime = this.getCurrentTimeInSeconds();
			this.lastTxRateBucket = Math.floor(this.getCurrentTimeInSeconds());
			this.fillRate = this.minFillRate;
			this.maxCapacity = this.minCapacity;
		}
		async getSendToken() {
			return this.acquireTokenBucket(1);
		}
		updateClientSendingRate(response) {
			let calculatedRate;
			this.updateMeasuredRate();
			const retryErrorInfo = response;
			if (retryErrorInfo?.errorType === "THROTTLING" || isThrottlingError(retryErrorInfo?.error ?? response)) {
				const rateToUse = !this.enabled ? this.measuredTxRate : Math.min(this.measuredTxRate, this.fillRate);
				this.lastMaxRate = rateToUse;
				this.calculateTimeWindow();
				this.lastThrottleTime = this.getCurrentTimeInSeconds();
				calculatedRate = this.cubicThrottle(rateToUse);
				this.enableTokenBucket();
			} else {
				this.calculateTimeWindow();
				calculatedRate = this.cubicSuccess(this.getCurrentTimeInSeconds());
			}
			const newRate = Math.min(calculatedRate, 2 * this.measuredTxRate);
			this.updateTokenBucketRate(newRate);
		}
		getCurrentTimeInSeconds() {
			return Date.now() / 1e3;
		}
		async acquireTokenBucket(amount) {
			if (!this.enabled) return;
			this.refillTokenBucket();
			while (amount > this.availableTokens) {
				const delay = (amount - this.availableTokens) / this.fillRate * 1e3;
				await new Promise((resolve) => DefaultRateLimiter.setTimeoutFn(resolve, delay));
				this.refillTokenBucket();
			}
			this.availableTokens = this.availableTokens - amount;
		}
		refillTokenBucket() {
			const timestamp = this.getCurrentTimeInSeconds();
			if (!this.lastTimestamp) {
				this.lastTimestamp = timestamp;
				return;
			}
			const fillAmount = (timestamp - this.lastTimestamp) * this.fillRate;
			this.availableTokens = Math.min(this.maxCapacity, this.availableTokens + fillAmount);
			this.lastTimestamp = timestamp;
		}
		calculateTimeWindow() {
			this.timeWindow = this.getPrecise(Math.pow(this.lastMaxRate * (1 - this.beta) / this.scaleConstant, 1 / 3));
		}
		cubicThrottle(rateToUse) {
			return this.getPrecise(rateToUse * this.beta);
		}
		cubicSuccess(timestamp) {
			return this.getPrecise(this.scaleConstant * Math.pow(timestamp - this.lastThrottleTime - this.timeWindow, 3) + this.lastMaxRate);
		}
		enableTokenBucket() {
			this.enabled = true;
		}
		updateTokenBucketRate(newRate) {
			this.refillTokenBucket();
			this.fillRate = Math.max(newRate, this.minFillRate);
			this.maxCapacity = Math.max(newRate, this.minCapacity);
			this.availableTokens = Math.min(this.availableTokens, this.maxCapacity);
		}
		updateMeasuredRate() {
			const t = this.getCurrentTimeInSeconds();
			const timeBucket = Math.floor(t * 2) / 2;
			this.requestCount++;
			if (timeBucket > this.lastTxRateBucket) {
				const currentRate = this.requestCount / (timeBucket - this.lastTxRateBucket);
				this.measuredTxRate = this.getPrecise(currentRate * this.smooth + this.measuredTxRate * (1 - this.smooth));
				this.requestCount = 0;
				this.lastTxRateBucket = timeBucket;
			}
		}
		getPrecise(num) {
			return parseFloat(num.toFixed(8));
		}
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/retry/util-retry/retries-2026-config.js
var Retry;
var init_retries_2026_config = __esmMin((() => {
	Retry = class Retry {
		static v2026 = typeof process !== "undefined" && process.env?.SMITHY_NEW_RETRIES_2026 === "true";
		static delay() {
			return Retry.v2026 ? 50 : 100;
		}
		static throttlingDelay() {
			return Retry.v2026 ? 1e3 : 500;
		}
		static cost() {
			return Retry.v2026 ? 14 : 5;
		}
		static throttlingCost() {
			return Retry.v2026 ? 5 : 10;
		}
		static modifiedCostType() {
			return Retry.v2026 ? "THROTTLING" : "TRANSIENT";
		}
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/retry/util-retry/DefaultRetryBackoffStrategy.js
var DefaultRetryBackoffStrategy;
var init_DefaultRetryBackoffStrategy = __esmMin((() => {
	init_constants$4();
	init_retries_2026_config();
	DefaultRetryBackoffStrategy = class {
		x = Retry.delay();
		computeNextBackoffDelay(i) {
			const t_i = Math.random() * Math.min(this.x * 2 ** i, MAXIMUM_RETRY_DELAY);
			return Math.floor(t_i);
		}
		setDelayBase(delay) {
			this.x = delay;
		}
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/retry/util-retry/DefaultRetryToken.js
var DefaultRetryToken;
var init_DefaultRetryToken = __esmMin((() => {
	init_constants$4();
	DefaultRetryToken = class {
		delay;
		count;
		cost;
		longPoll;
		$retryLog = { acquisitionDelay: 0 };
		constructor(delay, count, cost, longPoll) {
			this.delay = delay;
			this.count = count;
			this.cost = cost;
			this.longPoll = longPoll;
		}
		getRetryCount() {
			return this.count;
		}
		getRetryDelay() {
			return Math.min(MAXIMUM_RETRY_DELAY, this.delay);
		}
		getRetryCost() {
			return this.cost;
		}
		isLongPoll() {
			return this.longPoll;
		}
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/retry/util-retry/config.js
var RETRY_MODES, DEFAULT_RETRY_MODE;
var init_config = __esmMin((() => {
	(function(RETRY_MODES) {
		RETRY_MODES["STANDARD"] = "standard";
		RETRY_MODES["ADAPTIVE"] = "adaptive";
	})(RETRY_MODES || (RETRY_MODES = {}));
	DEFAULT_RETRY_MODE = RETRY_MODES.STANDARD;
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/retry/util-retry/StandardRetryStrategy.js
var refusal, StandardRetryStrategy;
var init_StandardRetryStrategy = __esmMin((() => {
	init_DefaultRetryBackoffStrategy();
	init_DefaultRetryToken();
	init_config();
	init_constants$4();
	init_retries_2026_config();
	refusal = {
		incompatible: 1,
		attempts: 2,
		capacity: 3
	};
	StandardRetryStrategy = class {
		mode = RETRY_MODES.STANDARD;
		retryBackoffStrategy;
		capacity = 500;
		maxAttemptsProvider;
		baseDelay;
		constructor(arg1) {
			if (typeof arg1 === "number") this.maxAttemptsProvider = async () => arg1;
			else if (typeof arg1 === "function") this.maxAttemptsProvider = arg1;
			else if (arg1 && typeof arg1 === "object") {
				this.maxAttemptsProvider = async () => arg1.maxAttempts;
				this.baseDelay = arg1.baseDelay;
				this.retryBackoffStrategy = arg1.backoff;
			}
			this.maxAttemptsProvider ??= async () => 3;
			this.baseDelay ??= Retry.delay();
			this.retryBackoffStrategy ??= new DefaultRetryBackoffStrategy();
		}
		async acquireInitialRetryToken(retryTokenScope) {
			return new DefaultRetryToken(Retry.delay(), 0, void 0, Retry.v2026 && retryTokenScope.includes(":longpoll"));
		}
		async refreshRetryTokenForRetry(token, errorInfo) {
			const maxAttempts = await this.getMaxAttempts();
			const retryCode = this.retryCode(token, errorInfo, maxAttempts);
			const shouldRetry = retryCode === 0;
			const isLongPoll = token.isLongPoll?.();
			if (shouldRetry || isLongPoll) {
				const errorType = errorInfo.errorType;
				this.retryBackoffStrategy.setDelayBase(errorType === "THROTTLING" ? Retry.throttlingDelay() : this.baseDelay);
				const delayFromErrorType = this.retryBackoffStrategy.computeNextBackoffDelay(token.getRetryCount());
				let retryDelay = delayFromErrorType;
				if (errorInfo.retryAfterHint instanceof Date) retryDelay = Math.max(delayFromErrorType, Math.min(errorInfo.retryAfterHint.getTime() - Date.now(), delayFromErrorType + 5e3));
				if (!shouldRetry) {
					const longPollBackoff = Retry.v2026 && retryCode === refusal.capacity && isLongPoll ? retryDelay : 0;
					if (longPollBackoff > 0) await new Promise((r) => setTimeout(r, longPollBackoff));
				} else {
					const capacityCost = this.getCapacityCost(errorType);
					this.capacity -= capacityCost;
					const nextToken = new DefaultRetryToken(0, token.getRetryCount() + 1, capacityCost, token.isLongPoll?.() ?? false);
					await new Promise((r) => setTimeout(r, retryDelay));
					nextToken.$retryLog.acquisitionDelay = retryDelay;
					return nextToken;
				}
			}
			throw new Error("No retry token available");
		}
		recordSuccess(token) {
			this.capacity = Math.min(500, this.capacity + (token.getRetryCost() ?? 1));
		}
		getCapacity() {
			return this.capacity;
		}
		async maxAttempts() {
			return this.maxAttemptsProvider();
		}
		async getMaxAttempts() {
			try {
				return await this.maxAttemptsProvider();
			} catch (ignored) {
				console.warn(`Max attempts provider could not resolve. Using default of 3`);
				return 3;
			}
		}
		retryCode(tokenToRenew, errorInfo, maxAttempts) {
			const attempts = tokenToRenew.getRetryCount() + 1;
			const retryableStatus = this.isRetryableError(errorInfo.errorType) ? 0 : refusal.incompatible;
			const attemptStatus = attempts < maxAttempts ? 0 : refusal.attempts;
			const capacityStatus = this.capacity >= this.getCapacityCost(errorInfo.errorType) ? 0 : refusal.capacity;
			return retryableStatus || attemptStatus || capacityStatus;
		}
		getCapacityCost(errorType) {
			return errorType === Retry.modifiedCostType() ? Retry.throttlingCost() : Retry.cost();
		}
		isRetryableError(errorType) {
			return errorType === "THROTTLING" || errorType === "TRANSIENT";
		}
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/retry/util-retry/AdaptiveRetryStrategy.js
var AdaptiveRetryStrategy;
var init_AdaptiveRetryStrategy = __esmMin((() => {
	init_DefaultRateLimiter();
	init_StandardRetryStrategy();
	init_config();
	AdaptiveRetryStrategy = class {
		mode = RETRY_MODES.ADAPTIVE;
		rateLimiter;
		standardRetryStrategy;
		constructor(maxAttemptsProvider, options) {
			const { rateLimiter } = options ?? {};
			this.rateLimiter = rateLimiter ?? new DefaultRateLimiter();
			this.standardRetryStrategy = options ? new StandardRetryStrategy({
				maxAttempts: typeof maxAttemptsProvider === "number" ? maxAttemptsProvider : 3,
				...options
			}) : new StandardRetryStrategy(maxAttemptsProvider);
		}
		async acquireInitialRetryToken(retryTokenScope) {
			const token = await this.standardRetryStrategy.acquireInitialRetryToken(retryTokenScope);
			await this.rateLimiter.getSendToken();
			return token;
		}
		async refreshRetryTokenForRetry(tokenToRenew, errorInfo) {
			this.rateLimiter.updateClientSendingRate(errorInfo);
			const token = await this.standardRetryStrategy.refreshRetryTokenForRetry(tokenToRenew, errorInfo);
			await this.rateLimiter.getSendToken();
			return token;
		}
		recordSuccess(token) {
			this.rateLimiter.updateClientSendingRate({});
			this.standardRetryStrategy.recordSuccess(token);
		}
		async maxAttemptsProvider() {
			return this.standardRetryStrategy.maxAttempts();
		}
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/submodules/retry/middleware-retry/configurations.js
var ENV_MAX_ATTEMPTS, CONFIG_MAX_ATTEMPTS, NODE_MAX_ATTEMPT_CONFIG_OPTIONS, resolveRetryConfig, ENV_RETRY_MODE, CONFIG_RETRY_MODE, NODE_RETRY_MODE_CONFIG_OPTIONS;
var init_configurations$1 = __esmMin((() => {
	init_client$1();
	init_AdaptiveRetryStrategy();
	init_StandardRetryStrategy();
	init_config();
	init_retries_2026_config();
	ENV_MAX_ATTEMPTS = "AWS_MAX_ATTEMPTS";
	CONFIG_MAX_ATTEMPTS = "max_attempts";
	NODE_MAX_ATTEMPT_CONFIG_OPTIONS = {
		environmentVariableSelector: (env) => {
			const value = env[ENV_MAX_ATTEMPTS];
			if (!value) return void 0;
			const maxAttempt = parseInt(value);
			if (Number.isNaN(maxAttempt)) throw new Error(`Environment variable ${ENV_MAX_ATTEMPTS} mast be a number, got "${value}"`);
			return maxAttempt;
		},
		configFileSelector: (profile) => {
			const value = profile[CONFIG_MAX_ATTEMPTS];
			if (!value) return void 0;
			const maxAttempt = parseInt(value);
			if (Number.isNaN(maxAttempt)) throw new Error(`Shared config file entry ${CONFIG_MAX_ATTEMPTS} mast be a number, got "${value}"`);
			return maxAttempt;
		},
		default: 3
	};
	resolveRetryConfig = (input, defaults) => {
		const { retryStrategy, retryMode } = input;
		const { defaultMaxAttempts = 3, defaultBaseDelay = Retry.delay() } = defaults ?? {};
		const maxAttemptsProvider = normalizeProvider$1(input.maxAttempts ?? defaultMaxAttempts);
		let controller = retryStrategy ? Promise.resolve(retryStrategy) : void 0;
		const getDefault = async () => {
			const maxAttempts = await maxAttemptsProvider();
			if (await normalizeProvider$1(retryMode)() === RETRY_MODES.ADAPTIVE) return new AdaptiveRetryStrategy(maxAttemptsProvider, {
				maxAttempts,
				baseDelay: defaultBaseDelay
			});
			return new StandardRetryStrategy({
				maxAttempts,
				baseDelay: defaultBaseDelay
			});
		};
		return Object.assign(input, {
			maxAttempts: maxAttemptsProvider,
			retryStrategy: () => controller ??= getDefault()
		});
	};
	ENV_RETRY_MODE = "AWS_RETRY_MODE";
	CONFIG_RETRY_MODE = "retry_mode";
	NODE_RETRY_MODE_CONFIG_OPTIONS = {
		environmentVariableSelector: (env) => env[ENV_RETRY_MODE],
		configFileSelector: (profile) => profile[CONFIG_RETRY_MODE],
		default: DEFAULT_RETRY_MODE
	};
})), getRetryPlugin;
var init_retry$1 = __esmMin((() => {
	init_isStreamingPayload();
	init_retryMiddleware();
	init_service_error_classification();
	init_AdaptiveRetryStrategy();
	init_StandardRetryStrategy();
	init_retries_2026_config();
	init_DefaultRateLimiter();
	init_config();
	init_constants$4();
	init_protocols$1();
	init_serde();
	init_util();
	init_configurations$1();
	init_parseRetryAfterHeader();
	getRetryPlugin = bindGetRetryPlugin(isStreamingPayload);
}));
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/client/setFeature.js
function setFeature(context, feature, value) {
	if (!context.__aws_sdk_context) context.__aws_sdk_context = { features: {} };
	else if (!context.__aws_sdk_context.features) context.__aws_sdk_context.features = {};
	context.__aws_sdk_context.features[feature] = value;
}
var init_setFeature = __esmMin((() => {
	init_retry$1();
	Retry.v2026 ||= typeof process === "object" && process.env?.AWS_NEW_RETRIES_2026 === "true";
}));
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/client/middleware-host-header/hostHeaderMiddleware.js
function resolveHostHeaderConfig(input) {
	return input;
}
var hostHeaderMiddleware, hostHeaderMiddlewareOptions, getHostHeaderPlugin;
var init_hostHeaderMiddleware = __esmMin((() => {
	init_protocols$1();
	hostHeaderMiddleware = (options) => (next) => async (args) => {
		if (!HttpRequest.isInstance(args.request)) return next(args);
		const { request } = args;
		const { handlerProtocol = "" } = options.requestHandler.metadata || {};
		if (handlerProtocol.indexOf("h2") >= 0 && !request.headers[":authority"]) {
			delete request.headers["host"];
			request.headers[":authority"] = request.hostname + (request.port ? ":" + request.port : "");
		} else if (!request.headers["host"]) {
			let host = request.hostname;
			if (request.port != null) host += `:${request.port}`;
			request.headers["host"] = host;
		}
		return next(args);
	};
	hostHeaderMiddlewareOptions = {
		name: "hostHeaderMiddleware",
		step: "build",
		priority: "low",
		tags: ["HOST"],
		override: true
	};
	getHostHeaderPlugin = (options) => ({ applyToStack: (clientStack) => {
		clientStack.add(hostHeaderMiddleware(options), hostHeaderMiddlewareOptions);
	} });
}));
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/client/middleware-logger/loggerMiddleware.js
var loggerMiddleware, loggerMiddlewareOptions, getLoggerPlugin;
var init_loggerMiddleware = __esmMin((() => {
	loggerMiddleware = () => (next, context) => async (args) => {
		try {
			const response = await next(args);
			const { clientName, commandName, logger, dynamoDbDocumentClientOptions = {} } = context;
			const { overrideInputFilterSensitiveLog, overrideOutputFilterSensitiveLog } = dynamoDbDocumentClientOptions;
			const inputFilterSensitiveLog = overrideInputFilterSensitiveLog ?? context.inputFilterSensitiveLog;
			const outputFilterSensitiveLog = overrideOutputFilterSensitiveLog ?? context.outputFilterSensitiveLog;
			const { $metadata, ...outputWithoutMetadata } = response.output;
			logger?.info?.({
				clientName,
				commandName,
				input: inputFilterSensitiveLog(args.input),
				output: outputFilterSensitiveLog(outputWithoutMetadata),
				metadata: $metadata
			});
			return response;
		} catch (error) {
			const { clientName, commandName, logger, dynamoDbDocumentClientOptions = {} } = context;
			const { overrideInputFilterSensitiveLog } = dynamoDbDocumentClientOptions;
			const inputFilterSensitiveLog = overrideInputFilterSensitiveLog ?? context.inputFilterSensitiveLog;
			logger?.error?.({
				clientName,
				commandName,
				input: inputFilterSensitiveLog(args.input),
				error,
				metadata: error.$metadata
			});
			throw error;
		}
	};
	loggerMiddlewareOptions = {
		name: "loggerMiddleware",
		tags: ["LOGGER"],
		step: "initialize",
		override: true
	};
	getLoggerPlugin = (options) => ({ applyToStack: (clientStack) => {
		clientStack.add(loggerMiddleware(), loggerMiddlewareOptions);
	} });
}));
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/client/middleware-recursion-detection/configuration.js
var recursionDetectionMiddlewareOptions;
var init_configuration = __esmMin((() => {
	recursionDetectionMiddlewareOptions = {
		step: "build",
		tags: ["RECURSION_DETECTION", "TRACE_CONTEXT_PROPAGATION"],
		name: "recursionDetectionMiddleware",
		override: true,
		priority: "low"
	};
}));
//#endregion
//#region ../../node_modules/@aws/lambda-invoke-store/dist-es/invoke-store.js
var PROTECTED_KEYS, NO_GLOBAL_AWS_LAMBDA, InvokeStoreBase, InvokeStoreSingle, InvokeStoreMulti, InvokeStore;
var init_invoke_store = __esmMin((() => {
	PROTECTED_KEYS = {
		REQUEST_ID: Symbol.for("_AWS_LAMBDA_REQUEST_ID"),
		X_RAY_TRACE_ID: Symbol.for("_AWS_LAMBDA_X_RAY_TRACE_ID"),
		TENANT_ID: Symbol.for("_AWS_LAMBDA_TENANT_ID"),
		TRACEPARENT: Symbol.for("_AWS_LAMBDA_TRACEPARENT"),
		TRACESTATE: Symbol.for("_AWS_LAMBDA_TRACESTATE"),
		BAGGAGE: Symbol.for("_AWS_LAMBDA_BAGGAGE")
	};
	NO_GLOBAL_AWS_LAMBDA = ["true", "1"].includes(process.env?.AWS_LAMBDA_NODEJS_NO_GLOBAL_AWSLAMBDA ?? "");
	if (!NO_GLOBAL_AWS_LAMBDA) globalThis.awslambda = globalThis.awslambda || {};
	InvokeStoreBase = class {
		static PROTECTED_KEYS = PROTECTED_KEYS;
		isProtectedKey(key) {
			return Object.values(PROTECTED_KEYS).includes(key);
		}
		getRequestId() {
			return this.get(PROTECTED_KEYS.REQUEST_ID) ?? "-";
		}
		getXRayTraceId() {
			return this.get(PROTECTED_KEYS.X_RAY_TRACE_ID);
		}
		getTenantId() {
			return this.get(PROTECTED_KEYS.TENANT_ID);
		}
		getTraceparent() {
			return this.get(PROTECTED_KEYS.TRACEPARENT);
		}
		getTracestate() {
			return this.get(PROTECTED_KEYS.TRACESTATE);
		}
		getBaggage() {
			return this.get(PROTECTED_KEYS.BAGGAGE);
		}
	};
	InvokeStoreSingle = class extends InvokeStoreBase {
		currentContext;
		getContext() {
			return this.currentContext;
		}
		hasContext() {
			return this.currentContext !== void 0;
		}
		get(key) {
			return this.currentContext?.[key];
		}
		set(key, value) {
			if (this.isProtectedKey(key)) throw new Error(`Cannot modify protected Lambda context field: ${String(key)}`);
			this.currentContext = this.currentContext || {};
			this.currentContext[key] = value;
		}
		run(context, fn) {
			this.currentContext = context;
			return fn();
		}
	};
	InvokeStoreMulti = class InvokeStoreMulti extends InvokeStoreBase {
		als;
		static async create() {
			const instance = new InvokeStoreMulti();
			instance.als = new (await (import("node:async_hooks"))).AsyncLocalStorage();
			return instance;
		}
		getContext() {
			return this.als.getStore();
		}
		hasContext() {
			return this.als.getStore() !== void 0;
		}
		get(key) {
			return this.als.getStore()?.[key];
		}
		set(key, value) {
			if (this.isProtectedKey(key)) throw new Error(`Cannot modify protected Lambda context field: ${String(key)}`);
			const store = this.als.getStore();
			if (!store) throw new Error("No context available");
			store[key] = value;
		}
		run(context, fn) {
			return this.als.run(context, fn);
		}
	};
	(function(InvokeStore) {
		let instance = null;
		async function getInstanceAsync(forceInvokeStoreMulti) {
			if (!instance) instance = (async () => {
				const newInstance = forceInvokeStoreMulti === true || "AWS_LAMBDA_MAX_CONCURRENCY" in process.env ? await InvokeStoreMulti.create() : new InvokeStoreSingle();
				if (!NO_GLOBAL_AWS_LAMBDA && globalThis.awslambda?.InvokeStore) return globalThis.awslambda.InvokeStore;
				else if (!NO_GLOBAL_AWS_LAMBDA && globalThis.awslambda) {
					globalThis.awslambda.InvokeStore = newInstance;
					return newInstance;
				} else return newInstance;
			})();
			return instance;
		}
		InvokeStore.getInstanceAsync = getInstanceAsync;
		InvokeStore._testing = process.env.AWS_LAMBDA_BENCHMARK_MODE === "1" ? { reset: () => {
			instance = null;
			if (globalThis.awslambda?.InvokeStore) delete globalThis.awslambda.InvokeStore;
			globalThis.awslambda = { InvokeStore: void 0 };
		} } : void 0;
	})(InvokeStore || (InvokeStore = {}));
}));
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/client/middleware-recursion-detection/recursionDetectionMiddleware.js
function sanitizeTraceHeaders(headers) {
	for (const header of Object.keys(headers)) {
		const lower = header.toLowerCase();
		if (header !== lower && (lower === TRACEPARENT || lower === TRACESTATE || lower === BAGGAGE)) {
			headers[lower] = headers[header];
			delete headers[header];
		}
	}
}
var AWS_LAMBDA_FUNCTION_NAME, _X_AMZN_TRACE_ID, X_AMZN_TRACE_ID, TRACEPARENT, TRACESTATE, BAGGAGE, recursionDetectionMiddleware;
var init_recursionDetectionMiddleware = __esmMin((() => {
	init_invoke_store();
	init_protocols$1();
	AWS_LAMBDA_FUNCTION_NAME = "AWS_LAMBDA_FUNCTION_NAME";
	_X_AMZN_TRACE_ID = "_X_AMZN_TRACE_ID";
	X_AMZN_TRACE_ID = "X-Amzn-Trace-Id";
	TRACEPARENT = "traceparent";
	TRACESTATE = "tracestate";
	BAGGAGE = "baggage";
	recursionDetectionMiddleware = () => (next) => async (args) => {
		const { request } = args;
		if (!HttpRequest.isInstance(request)) return next(args);
		let invokeStore;
		{
			const traceIdHeader = Object.keys(request.headers ?? {}).find((h) => h.toLowerCase() === X_AMZN_TRACE_ID.toLowerCase()) ?? X_AMZN_TRACE_ID;
			if (!request.headers.hasOwnProperty(traceIdHeader)) {
				const functionName = process.env[AWS_LAMBDA_FUNCTION_NAME];
				const traceIdFromEnv = process.env[_X_AMZN_TRACE_ID];
				invokeStore ??= await InvokeStore.getInstanceAsync();
				const traceId = invokeStore?.getXRayTraceId() ?? traceIdFromEnv;
				const nonEmptyString = (str) => typeof str === "string" && str.length > 0;
				if (nonEmptyString(functionName) && nonEmptyString(traceId)) request.headers[X_AMZN_TRACE_ID] = traceId;
			}
		}
		sanitizeTraceHeaders(request.headers);
		if (!request.headers[TRACEPARENT]) {
			const traceparent = (invokeStore ??= await InvokeStore.getInstanceAsync())?.getTraceparent?.();
			if (traceparent) {
				request.headers[TRACEPARENT] = traceparent;
				const tracestate = invokeStore?.getTracestate?.();
				if (tracestate) request.headers[TRACESTATE] = tracestate;
				const baggage = invokeStore?.getBaggage?.();
				if (baggage) request.headers[BAGGAGE] = baggage;
			}
		}
		return next(args);
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/client/middleware-recursion-detection/getRecursionDetectionPlugin.js
var getRecursionDetectionPlugin;
var init_getRecursionDetectionPlugin = __esmMin((() => {
	init_configuration();
	init_recursionDetectionMiddleware();
	getRecursionDetectionPlugin = (options) => ({ applyToStack: (clientStack) => {
		clientStack.add(recursionDetectionMiddleware(), recursionDetectionMiddlewareOptions);
	} });
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/legacy-root-exports/middleware-http-auth-scheme/resolveAuthOptions.js
var resolveAuthOptions;
var init_resolveAuthOptions = __esmMin((() => {
	resolveAuthOptions = (candidateAuthOptions, authSchemePreference) => {
		if (!authSchemePreference || authSchemePreference.length === 0) return candidateAuthOptions;
		const preferredAuthOptions = [];
		for (const preferredSchemeName of authSchemePreference) for (const candidateAuthOption of candidateAuthOptions) if (candidateAuthOption.schemeId.split("#")[1] === preferredSchemeName) preferredAuthOptions.push(candidateAuthOption);
		for (const candidateAuthOption of candidateAuthOptions) if (!preferredAuthOptions.find(({ schemeId }) => schemeId === candidateAuthOption.schemeId)) preferredAuthOptions.push(candidateAuthOption);
		return preferredAuthOptions;
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/legacy-root-exports/middleware-http-auth-scheme/httpAuthSchemeMiddleware.js
function convertHttpAuthSchemesToMap(httpAuthSchemes) {
	const map = /* @__PURE__ */ new Map();
	for (const scheme of httpAuthSchemes) map.set(scheme.schemeId, scheme);
	return map;
}
var httpAuthSchemeMiddleware;
var init_httpAuthSchemeMiddleware = __esmMin((() => {
	init_transport();
	init_resolveAuthOptions();
	httpAuthSchemeMiddleware = (config, mwOptions) => (next, context) => async (args) => {
		const options = config.httpAuthSchemeProvider(await mwOptions.httpAuthSchemeParametersProvider(config, context, args.input));
		const authSchemePreference = config.authSchemePreference ? await config.authSchemePreference() : [];
		const resolvedOptions = resolveAuthOptions(options, authSchemePreference);
		const authSchemes = convertHttpAuthSchemesToMap(config.httpAuthSchemes);
		const smithyContext = getSmithyContext(context);
		const failureReasons = [];
		for (const option of resolvedOptions) {
			const scheme = authSchemes.get(option.schemeId);
			if (!scheme) {
				failureReasons.push(`HttpAuthScheme \`${option.schemeId}\` was not enabled for this service.`);
				continue;
			}
			const identityProvider = scheme.identityProvider(await mwOptions.identityProviderConfigProvider(config));
			if (!identityProvider) {
				failureReasons.push(`HttpAuthScheme \`${option.schemeId}\` did not have an IdentityProvider configured.`);
				continue;
			}
			const { identityProperties = {}, signingProperties = {} } = option.propertiesExtractor?.(config, context) || {};
			option.identityProperties = Object.assign(option.identityProperties || {}, identityProperties);
			option.signingProperties = Object.assign(option.signingProperties || {}, signingProperties);
			smithyContext.selectedHttpAuthScheme = {
				httpAuthOption: option,
				identity: await identityProvider(option.identityProperties),
				signer: scheme.signer
			};
			break;
		}
		if (!smithyContext.selectedHttpAuthScheme) throw new Error(failureReasons.join("\n"));
		return next(args);
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/legacy-root-exports/middleware-http-auth-scheme/getHttpAuthSchemeEndpointRuleSetPlugin.js
var httpAuthSchemeEndpointRuleSetMiddlewareOptions, getHttpAuthSchemeEndpointRuleSetPlugin;
var init_getHttpAuthSchemeEndpointRuleSetPlugin = __esmMin((() => {
	init_httpAuthSchemeMiddleware();
	httpAuthSchemeEndpointRuleSetMiddlewareOptions = {
		step: "serialize",
		tags: ["HTTP_AUTH_SCHEME"],
		name: "httpAuthSchemeMiddleware",
		override: true,
		relation: "before",
		toMiddleware: "endpointV2Middleware"
	};
	getHttpAuthSchemeEndpointRuleSetPlugin = (config, { httpAuthSchemeParametersProvider, identityProviderConfigProvider }) => ({ applyToStack: (clientStack) => {
		clientStack.addRelativeTo(httpAuthSchemeMiddleware(config, {
			httpAuthSchemeParametersProvider,
			identityProviderConfigProvider
		}), httpAuthSchemeEndpointRuleSetMiddlewareOptions);
	} });
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/legacy-root-exports/middleware-http-auth-scheme/index.js
var init_middleware_http_auth_scheme = __esmMin((() => {
	init_httpAuthSchemeMiddleware();
	init_getHttpAuthSchemeEndpointRuleSetPlugin();
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/legacy-root-exports/middleware-http-signing/httpSigningMiddleware.js
var defaultErrorHandler$1, defaultSuccessHandler$1, httpSigningMiddleware;
var init_httpSigningMiddleware = __esmMin((() => {
	init_protocols$1();
	init_transport();
	defaultErrorHandler$1 = (signingProperties) => (error) => {
		throw error;
	};
	defaultSuccessHandler$1 = (httpResponse, signingProperties) => {};
	httpSigningMiddleware = (config) => (next, context) => async (args) => {
		if (!HttpRequest.isInstance(args.request)) return next(args);
		const scheme = getSmithyContext(context).selectedHttpAuthScheme;
		if (!scheme) throw new Error(`No HttpAuthScheme was selected: unable to sign request`);
		const { httpAuthOption: { signingProperties = {} }, identity, signer } = scheme;
		const output = await next({
			...args,
			request: await signer.sign(args.request, identity, signingProperties)
		}).catch((signer.errorHandler || defaultErrorHandler$1)(signingProperties));
		(signer.successHandler || defaultSuccessHandler$1)(output.response, signingProperties);
		return output;
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/legacy-root-exports/middleware-http-signing/getHttpSigningMiddleware.js
var httpSigningMiddlewareOptions, getHttpSigningPlugin;
var init_getHttpSigningMiddleware = __esmMin((() => {
	init_httpSigningMiddleware();
	httpSigningMiddlewareOptions = {
		step: "finalizeRequest",
		tags: ["HTTP_SIGNING"],
		name: "httpSigningMiddleware",
		aliases: [
			"apiKeyMiddleware",
			"tokenMiddleware",
			"awsAuthMiddleware"
		],
		override: true,
		relation: "after",
		toMiddleware: "retryMiddleware"
	};
	getHttpSigningPlugin = (config) => ({ applyToStack: (clientStack) => {
		clientStack.addRelativeTo(httpSigningMiddleware(config), httpSigningMiddlewareOptions);
	} });
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/legacy-root-exports/middleware-http-signing/index.js
var init_middleware_http_signing = __esmMin((() => {
	init_httpSigningMiddleware();
	init_getHttpSigningMiddleware();
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/normalizeProvider.js
var normalizeProvider;
var init_normalizeProvider = __esmMin((() => {
	normalizeProvider = (input) => {
		if (typeof input === "function") return input;
		const promisified = Promise.resolve(input);
		return () => promisified;
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/legacy-root-exports/util-identity-and-auth/DefaultIdentityProviderConfig.js
var DefaultIdentityProviderConfig;
var init_DefaultIdentityProviderConfig = __esmMin((() => {
	init_transport();
	DefaultIdentityProviderConfig = class {
		authSchemes = /* @__PURE__ */ new Map();
		constructor(config) {
			for (const key in config) {
				if (!hasOwn(config, key)) continue;
				const value = config[key];
				if (value !== void 0) this.authSchemes.set(key, value);
			}
		}
		getIdentityProvider(schemeId) {
			return this.authSchemes.get(schemeId);
		}
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/legacy-root-exports/util-identity-and-auth/httpAuthSchemes/noAuth.js
var NoAuthSigner;
var init_noAuth = __esmMin((() => {
	NoAuthSigner = class {
		async sign(httpRequest, identity, signingProperties) {
			return httpRequest;
		}
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/legacy-root-exports/util-identity-and-auth/httpAuthSchemes/index.js
var init_httpAuthSchemes$1 = __esmMin((() => {
	init_protocols$1();
	init_dist_es$14();
	init_noAuth();
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/legacy-root-exports/util-identity-and-auth/memoizeIdentityProvider.js
var createIsIdentityExpiredFunction, EXPIRATION_MS, isIdentityExpired, doesIdentityRequireRefresh, memoizeIdentityProvider;
var init_memoizeIdentityProvider = __esmMin((() => {
	createIsIdentityExpiredFunction = (expirationMs) => function isIdentityExpired(identity) {
		return doesIdentityRequireRefresh(identity) && identity.expiration.getTime() - Date.now() < expirationMs;
	};
	EXPIRATION_MS = 3e5;
	isIdentityExpired = createIsIdentityExpiredFunction(EXPIRATION_MS);
	doesIdentityRequireRefresh = (identity) => identity.expiration !== void 0;
	memoizeIdentityProvider = (provider, isExpired, requiresRefresh) => {
		if (provider === void 0) return;
		const normalizedProvider = typeof provider !== "function" ? async () => Promise.resolve(provider) : provider;
		let resolved;
		let pending;
		let hasResult;
		let isConstant = false;
		const coalesceProvider = async (options) => {
			if (!pending) pending = normalizedProvider(options);
			try {
				resolved = await pending;
				hasResult = true;
				isConstant = false;
			} finally {
				pending = void 0;
			}
			return resolved;
		};
		if (isExpired === void 0) return async (options) => {
			if (!hasResult || options?.forceRefresh) resolved = await coalesceProvider(options);
			return resolved;
		};
		return async (options) => {
			if (!hasResult || options?.forceRefresh) resolved = await coalesceProvider(options);
			if (isConstant) return resolved;
			if (!requiresRefresh(resolved)) {
				isConstant = true;
				return resolved;
			}
			if (isExpired(resolved)) {
				await coalesceProvider(options);
				return resolved;
			}
			return resolved;
		};
	};
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/legacy-root-exports/util-identity-and-auth/index.js
var init_util_identity_and_auth = __esmMin((() => {
	init_DefaultIdentityProviderConfig();
	init_httpAuthSchemes$1();
	init_memoizeIdentityProvider();
}));
//#endregion
//#region ../../node_modules/@smithy/core/dist-es/index.js
var init_dist_es$13 = __esmMin((() => {
	init_transport();
	init_middleware_http_auth_scheme();
	init_middleware_http_signing();
	init_normalizeProvider();
	init_protocols$1();
	init_util_identity_and_auth();
}));
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/client/middleware-user-agent/configurations.js
function isValidUserAgentAppId(appId) {
	if (appId === void 0) return true;
	return typeof appId === "string" && appId.length <= 50;
}
function resolveUserAgentConfig(input) {
	const normalizedAppIdProvider = normalizeProvider(input.userAgentAppId ?? void 0);
	const { customUserAgent } = input;
	return Object.assign(input, {
		customUserAgent: typeof customUserAgent === "string" ? [[customUserAgent]] : customUserAgent,
		userAgentAppId: async () => {
			const appId = await normalizedAppIdProvider();
			if (!isValidUserAgentAppId(appId)) {
				const logger = input.logger?.constructor?.name === "NoOpLogger" || !input.logger ? console : input.logger;
				if (typeof appId !== "string") logger?.warn("userAgentAppId must be a string or undefined.");
				else if (appId.length > 50) logger?.warn("The provided userAgentAppId exceeds the maximum length of 50 characters.");
			}
			return appId;
		}
	});
}
var init_configurations = __esmMin((() => {
	init_dist_es$13();
}));
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/client/util-endpoints/lib/aws/partitions.js
var partitionsInfo;
var init_partitions = __esmMin((() => {
	partitionsInfo = {
		"partitions": [
			{
				"id": "aws",
				"outputs": {
					"dnsSuffix": "amazonaws.com",
					"dualStackDnsSuffix": "api.aws",
					"implicitGlobalRegion": "us-east-1",
					"name": "aws",
					"supportsDualStack": true,
					"supportsFIPS": true
				},
				"regionRegex": "^(us|eu|ap|sa|ca|me|af|il|mx)\\-\\w+\\-\\d+$",
				"regions": {
					"af-south-1": { "description": "Africa (Cape Town)" },
					"ap-east-1": { "description": "Asia Pacific (Hong Kong)" },
					"ap-east-2": { "description": "Asia Pacific (Taipei)" },
					"ap-northeast-1": { "description": "Asia Pacific (Tokyo)" },
					"ap-northeast-2": { "description": "Asia Pacific (Seoul)" },
					"ap-northeast-3": { "description": "Asia Pacific (Osaka)" },
					"ap-south-1": { "description": "Asia Pacific (Mumbai)" },
					"ap-south-2": { "description": "Asia Pacific (Hyderabad)" },
					"ap-southeast-1": { "description": "Asia Pacific (Singapore)" },
					"ap-southeast-2": { "description": "Asia Pacific (Sydney)" },
					"ap-southeast-3": { "description": "Asia Pacific (Jakarta)" },
					"ap-southeast-4": { "description": "Asia Pacific (Melbourne)" },
					"ap-southeast-5": { "description": "Asia Pacific (Malaysia)" },
					"ap-southeast-6": { "description": "Asia Pacific (New Zealand)" },
					"ap-southeast-7": { "description": "Asia Pacific (Thailand)" },
					"aws-global": { "description": "aws global region" },
					"ca-central-1": { "description": "Canada (Central)" },
					"ca-west-1": { "description": "Canada West (Calgary)" },
					"eu-central-1": { "description": "Europe (Frankfurt)" },
					"eu-central-2": { "description": "Europe (Zurich)" },
					"eu-north-1": { "description": "Europe (Stockholm)" },
					"eu-south-1": { "description": "Europe (Milan)" },
					"eu-south-2": { "description": "Europe (Spain)" },
					"eu-west-1": { "description": "Europe (Ireland)" },
					"eu-west-2": { "description": "Europe (London)" },
					"eu-west-3": { "description": "Europe (Paris)" },
					"il-central-1": { "description": "Israel (Tel Aviv)" },
					"me-central-1": { "description": "Middle East (UAE)" },
					"me-south-1": { "description": "Middle East (Bahrain)" },
					"mx-central-1": { "description": "Mexico (Central)" },
					"sa-east-1": { "description": "South America (Sao Paulo)" },
					"us-east-1": { "description": "US East (N. Virginia)" },
					"us-east-2": { "description": "US East (Ohio)" },
					"us-west-1": { "description": "US West (N. California)" },
					"us-west-2": { "description": "US West (Oregon)" }
				}
			},
			{
				"id": "aws-cn",
				"outputs": {
					"dnsSuffix": "amazonaws.com.cn",
					"dualStackDnsSuffix": "api.amazonwebservices.com.cn",
					"implicitGlobalRegion": "cn-northwest-1",
					"name": "aws-cn",
					"supportsDualStack": true,
					"supportsFIPS": true
				},
				"regionRegex": "^cn\\-\\w+\\-\\d+$",
				"regions": {
					"aws-cn-global": { "description": "aws-cn global region" },
					"cn-north-1": { "description": "China (Beijing)" },
					"cn-northwest-1": { "description": "China (Ningxia)" }
				}
			},
			{
				"id": "aws-eusc",
				"outputs": {
					"dnsSuffix": "amazonaws.eu",
					"dualStackDnsSuffix": "api.amazonwebservices.eu",
					"implicitGlobalRegion": "eusc-de-east-1",
					"name": "aws-eusc",
					"supportsDualStack": true,
					"supportsFIPS": true
				},
				"regionRegex": "^eusc\\-(de)\\-\\w+\\-\\d+$",
				"regions": { "eusc-de-east-1": { "description": "AWS European Sovereign Cloud (Germany)" } }
			},
			{
				"id": "aws-iso",
				"outputs": {
					"dnsSuffix": "c2s.ic.gov",
					"dualStackDnsSuffix": "api.aws.ic.gov",
					"implicitGlobalRegion": "us-iso-east-1",
					"name": "aws-iso",
					"supportsDualStack": true,
					"supportsFIPS": true
				},
				"regionRegex": "^us\\-iso\\-\\w+\\-\\d+$",
				"regions": {
					"aws-iso-global": { "description": "aws-iso global region" },
					"us-iso-east-1": { "description": "US ISO East" },
					"us-iso-west-1": { "description": "US ISO WEST" }
				}
			},
			{
				"id": "aws-iso-b",
				"outputs": {
					"dnsSuffix": "sc2s.sgov.gov",
					"dualStackDnsSuffix": "api.aws.scloud",
					"implicitGlobalRegion": "us-isob-east-1",
					"name": "aws-iso-b",
					"supportsDualStack": true,
					"supportsFIPS": true
				},
				"regionRegex": "^us\\-isob\\-\\w+\\-\\d+$",
				"regions": {
					"aws-iso-b-global": { "description": "aws-iso-b global region" },
					"us-isob-east-1": { "description": "US ISOB East (Ohio)" },
					"us-isob-west-1": { "description": "US ISOB West" }
				}
			},
			{
				"id": "aws-iso-e",
				"outputs": {
					"dnsSuffix": "cloud.adc-e.uk",
					"dualStackDnsSuffix": "api.cloud-aws.adc-e.uk",
					"implicitGlobalRegion": "eu-isoe-west-1",
					"name": "aws-iso-e",
					"supportsDualStack": true,
					"supportsFIPS": true
				},
				"regionRegex": "^eu\\-isoe\\-\\w+\\-\\d+$",
				"regions": {
					"aws-iso-e-global": { "description": "aws-iso-e global region" },
					"eu-isoe-west-1": { "description": "EU ISOE West" }
				}
			},
			{
				"id": "aws-iso-f",
				"outputs": {
					"dnsSuffix": "csp.hci.ic.gov",
					"dualStackDnsSuffix": "api.aws.hci.ic.gov",
					"implicitGlobalRegion": "us-isof-south-1",
					"name": "aws-iso-f",
					"supportsDualStack": true,
					"supportsFIPS": true
				},
				"regionRegex": "^us\\-isof\\-\\w+\\-\\d+$",
				"regions": {
					"aws-iso-f-global": { "description": "aws-iso-f global region" },
					"us-isof-east-1": { "description": "US ISOF EAST" },
					"us-isof-south-1": { "description": "US ISOF SOUTH" }
				}
			},
			{
				"id": "aws-us-gov",
				"outputs": {
					"dnsSuffix": "amazonaws.com",
					"dualStackDnsSuffix": "api.aws",
					"implicitGlobalRegion": "us-gov-west-1",
					"name": "aws-us-gov",
					"supportsDualStack": true,
					"supportsFIPS": true
				},
				"regionRegex": "^us\\-gov\\-\\w+\\-\\d+$",
				"regions": {
					"aws-us-gov-global": { "description": "aws-us-gov global region" },
					"us-gov-east-1": { "description": "AWS GovCloud (US-East)" },
					"us-gov-west-1": { "description": "AWS GovCloud (US-West)" }
				}
			}
		],
		"version": "1.1"
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/client/util-endpoints/lib/aws/partition.js
var selectedPartitionsInfo, selectedUserAgentPrefix, partition, getUserAgentPrefix;
var init_partition = __esmMin((() => {
	init_partitions();
	selectedPartitionsInfo = partitionsInfo;
	selectedUserAgentPrefix = "";
	partition = (value) => {
		const { partitions } = selectedPartitionsInfo;
		for (const partition of partitions) {
			const { regions, outputs } = partition;
			for (const [region, regionData] of Object.entries(regions)) if (region === value) return {
				...outputs,
				...regionData
			};
		}
		for (const partition of partitions) {
			const { regionRegex, outputs } = partition;
			if (new RegExp(regionRegex).test(value)) return { ...outputs };
		}
		const DEFAULT_PARTITION = partitions.find((partition) => partition.id === "aws");
		if (!DEFAULT_PARTITION) throw new Error("Provided region was not found in the partition array or regex, and default partition with id 'aws' doesn't exist.");
		return { ...DEFAULT_PARTITION.outputs };
	};
	getUserAgentPrefix = () => selectedUserAgentPrefix;
}));
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/client/middleware-user-agent/check-features.js
async function checkFeatures(context, config, args) {
	if (args.request?.headers?.["smithy-protocol"] === "rpc-v2-cbor") setFeature(context, "PROTOCOL_RPC_V2_CBOR", "M");
	if (typeof config.retryStrategy === "function") {
		const retryStrategy = await config.retryStrategy();
		if (typeof retryStrategy.mode === "string") switch (retryStrategy.mode) {
			case RETRY_MODES.ADAPTIVE:
				setFeature(context, "RETRY_MODE_ADAPTIVE", "F");
				break;
			case RETRY_MODES.STANDARD: setFeature(context, "RETRY_MODE_STANDARD", "E");
		}
	}
	if (typeof config.accountIdEndpointMode === "function") {
		const endpointV2 = context.endpointV2;
		if (String(endpointV2?.url?.hostname).match(ACCOUNT_ID_ENDPOINT_REGEX)) setFeature(context, "ACCOUNT_ID_ENDPOINT", "O");
		switch (await config.accountIdEndpointMode?.()) {
			case "disabled":
				setFeature(context, "ACCOUNT_ID_MODE_DISABLED", "Q");
				break;
			case "preferred":
				setFeature(context, "ACCOUNT_ID_MODE_PREFERRED", "P");
				break;
			case "required": setFeature(context, "ACCOUNT_ID_MODE_REQUIRED", "R");
		}
	}
	const identity = context.__smithy_context?.selectedHttpAuthScheme?.identity;
	if (identity?.$source) {
		const credentials = identity;
		if (credentials.accountId) setFeature(context, "RESOLVED_ACCOUNT_ID", "T");
		for (const [key, value] of Object.entries(credentials.$source ?? {})) setFeature(context, key, value);
	}
}
var ACCOUNT_ID_ENDPOINT_REGEX;
var init_check_features = __esmMin((() => {
	init_retry$1();
	init_setFeature();
	ACCOUNT_ID_ENDPOINT_REGEX = /\d{12}\.ddb/;
}));
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/client/middleware-user-agent/constants.js
var USER_AGENT, X_AMZ_USER_AGENT, UA_NAME_ESCAPE_REGEX, UA_VALUE_ESCAPE_REGEX;
var init_constants$3 = __esmMin((() => {
	USER_AGENT = "user-agent";
	X_AMZ_USER_AGENT = "x-amz-user-agent";
	UA_NAME_ESCAPE_REGEX = /[^!$%&'*+\-.^_`|~\w]/g;
	UA_VALUE_ESCAPE_REGEX = /[^!$%&'*+\-.^_`|~\w#]/g;
}));
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/client/middleware-user-agent/encode-features.js
function encodeFeatures(features) {
	let buffer = "";
	for (const key in features) {
		const val = features[key];
		if (buffer.length + val.length + 1 <= BYTE_LIMIT) {
			if (buffer.length) buffer += "," + val;
			else buffer += val;
			continue;
		}
		break;
	}
	return buffer;
}
var BYTE_LIMIT;
var init_encode_features = __esmMin((() => {
	BYTE_LIMIT = 1024;
}));
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/client/middleware-user-agent/user-agent-middleware.js
var userAgentMiddleware, escapeUserAgent, getUserAgentMiddlewareOptions, getUserAgentPlugin;
var init_user_agent_middleware = __esmMin((() => {
	init_protocols$1();
	init_partition();
	init_check_features();
	init_constants$3();
	init_encode_features();
	userAgentMiddleware = (options) => (next, context) => async (args) => {
		const { request } = args;
		if (!HttpRequest.isInstance(request)) return next(args);
		const { headers } = request;
		const userAgent = context?.userAgent?.map(escapeUserAgent) || [];
		const defaultUserAgent = (await options.defaultUserAgentProvider()).map(escapeUserAgent);
		await checkFeatures(context, options, args);
		const awsContext = context;
		defaultUserAgent.push(`m/${encodeFeatures(Object.assign({}, context.__smithy_context?.features, awsContext.__aws_sdk_context?.features))}`);
		const customUserAgent = options?.customUserAgent?.map(escapeUserAgent) || [];
		const appId = await options.userAgentAppId();
		if (appId) defaultUserAgent.push(escapeUserAgent([`app`, `${appId}`]));
		const prefix = getUserAgentPrefix();
		const sdkUserAgentValue = (prefix ? [prefix] : []).concat([
			...defaultUserAgent,
			...userAgent,
			...customUserAgent
		]).join(" ");
		const normalUAValue = [...defaultUserAgent.filter((section) => section.startsWith("aws-sdk-")), ...customUserAgent].join(" ");
		if (options.runtime !== "browser") {
			if (normalUAValue) headers[X_AMZ_USER_AGENT] = headers["x-amz-user-agent"] ? `${headers[USER_AGENT]} ${normalUAValue}` : normalUAValue;
			headers[USER_AGENT] = sdkUserAgentValue;
		} else headers[X_AMZ_USER_AGENT] = sdkUserAgentValue;
		return next({
			...args,
			request
		});
	};
	escapeUserAgent = (userAgentPair) => {
		const name = userAgentPair[0].split("/").map((part) => part.replace(UA_NAME_ESCAPE_REGEX, "-")).join("/");
		const version = userAgentPair[1]?.replace(UA_VALUE_ESCAPE_REGEX, "-");
		const prefixSeparatorIndex = name.indexOf("/");
		const prefix = name.substring(0, prefixSeparatorIndex);
		let uaName = name.substring(prefixSeparatorIndex + 1);
		if (prefix === "api") uaName = uaName.toLowerCase();
		return [
			prefix,
			uaName,
			version
		].filter((item) => item && item.length > 0).reduce((acc, item, index) => {
			switch (index) {
				case 0: return item;
				case 1: return `${acc}/${item}`;
				default: return `${acc}#${item}`;
			}
		}, "");
	};
	getUserAgentMiddlewareOptions = {
		name: "getUserAgentMiddleware",
		step: "build",
		priority: "low",
		tags: ["SET_USER_AGENT", "USER_AGENT"],
		override: true
	};
	getUserAgentPlugin = (config) => ({ applyToStack: (clientStack) => {
		clientStack.add(userAgentMiddleware(config), getUserAgentMiddlewareOptions);
	} });
}));
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/client/util-user-agent-node/getRuntimeUserAgentPair.js
var getRuntimeUserAgentPair;
var init_getRuntimeUserAgentPair = __esmMin((() => {
	getRuntimeUserAgentPair = () => {
		for (const runtime of [
			"deno",
			"bun",
			"llrt"
		]) if (versions[runtime]) return [`md/${runtime}`, versions[runtime]];
		return ["md/nodejs", versions.node];
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/client/util-user-agent-node/crt-availability.js
var crtAvailability;
var init_crt_availability = __esmMin((() => {
	crtAvailability = { isCrtAvailable: false };
}));
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/client/util-user-agent-node/is-crt-available.js
var isCrtAvailable;
var init_is_crt_available = __esmMin((() => {
	init_crt_availability();
	isCrtAvailable = () => {
		if (crtAvailability.isCrtAvailable) return ["md/crt-avail"];
		return null;
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/client/util-user-agent-node/defaultUserAgent.js
var createDefaultUserAgentProvider;
var init_defaultUserAgent = __esmMin((() => {
	init_getRuntimeUserAgentPair();
	init_is_crt_available();
	init_crt_availability();
	createDefaultUserAgentProvider = ({ serviceId, clientVersion }) => {
		const runtimeUserAgentPair = getRuntimeUserAgentPair();
		return async (config) => {
			const sections = [
				["aws-sdk-js", clientVersion],
				["ua", "2.1"],
				[`os/${platform()}`, release()],
				["lang/js"],
				runtimeUserAgentPair
			];
			const crtAvailable = isCrtAvailable();
			if (crtAvailable) sections.push(crtAvailable);
			if (serviceId) sections.push([`api/${serviceId}`, clientVersion]);
			if (env.AWS_EXECUTION_ENV) sections.push([`exec-env/${env.AWS_EXECUTION_ENV}`]);
			const appId = await config?.userAgentAppId?.();
			return appId ? [...sections, [`app/${appId}`]] : [...sections];
		};
	};
})), UA_APP_ID_ENV_NAME, UA_APP_ID_INI_NAME_DEPRECATED, NODE_APP_ID_CONFIG_OPTIONS;
var init_nodeAppIdConfigOptions = __esmMin((() => {
	init_configurations();
	UA_APP_ID_ENV_NAME = "AWS_SDK_UA_APP_ID";
	UA_APP_ID_INI_NAME_DEPRECATED = "sdk-ua-app-id";
	NODE_APP_ID_CONFIG_OPTIONS = {
		environmentVariableSelector: (env) => env[UA_APP_ID_ENV_NAME],
		configFileSelector: (profile) => profile["sdk_ua_app_id"] ?? profile[UA_APP_ID_INI_NAME_DEPRECATED],
		default: void 0
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/client/util-endpoints/lib/isIpAddress.js
var init_isIpAddress = __esmMin((() => {
	init_endpoints();
}));
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/client/util-endpoints/lib/aws/isVirtualHostableS3Bucket.js
var isVirtualHostableS3Bucket;
var init_isVirtualHostableS3Bucket = __esmMin((() => {
	init_endpoints();
	init_isIpAddress();
	isVirtualHostableS3Bucket = (value, allowSubDomains = false) => {
		if (allowSubDomains) {
			for (const label of value.split(".")) if (!isVirtualHostableS3Bucket(label)) return false;
			return true;
		}
		if (!isValidHostLabel(value)) return false;
		if (value.length < 3 || value.length > 63) return false;
		if (value !== value.toLowerCase()) return false;
		if (isIpAddress(value)) return false;
		return true;
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/client/util-endpoints/lib/aws/parseArn.js
var ARN_DELIMITER, RESOURCE_DELIMITER, parseArn;
var init_parseArn = __esmMin((() => {
	ARN_DELIMITER = ":";
	RESOURCE_DELIMITER = "/";
	parseArn = (value) => {
		const segments = value.split(ARN_DELIMITER);
		if (segments.length < 6) return null;
		const [arn, partition, service, region, accountId, ...resourcePath] = segments;
		if (arn !== "arn" || partition === "" || service === "" || resourcePath.join(ARN_DELIMITER) === "") return null;
		return {
			partition,
			service,
			region,
			accountId,
			resourceId: resourcePath.map((resource) => resource.split(RESOURCE_DELIMITER)).flat()
		};
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/client/util-endpoints/aws.js
var awsEndpointFunctions;
var init_aws = __esmMin((() => {
	init_endpoints();
	init_isVirtualHostableS3Bucket();
	init_parseArn();
	init_partition();
	awsEndpointFunctions = {
		isVirtualHostableS3Bucket,
		parseArn,
		partition
	};
	customEndpointFunctions.aws = awsEndpointFunctions;
}));
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/client/region-config-resolver/stsRegionDefaultResolver.js
function stsRegionDefaultResolver(loaderConfig = {}) {
	return loadConfig({
		...NODE_REGION_CONFIG_OPTIONS,
		async default() {
			if (!warning.silence) console.warn("@aws-sdk - WARN - default STS region of us-east-1 used. See @aws-sdk/credential-providers README and set a region explicitly.");
			return "us-east-1";
		}
	}, {
		...NODE_REGION_CONFIG_FILE_OPTIONS,
		...loaderConfig
	});
}
var warning;
var init_stsRegionDefaultResolver = __esmMin((() => {
	init_config$1();
	warning = { silence: false };
}));
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/client/region-config-resolver/extensions.js
var getAwsRegionExtensionConfiguration, resolveAwsRegionExtensionConfiguration;
var init_extensions = __esmMin((() => {
	getAwsRegionExtensionConfiguration = (runtimeConfig) => {
		return {
			setRegion(region) {
				runtimeConfig.region = region;
			},
			region() {
				return runtimeConfig.region;
			}
		};
	};
	resolveAwsRegionExtensionConfiguration = (awsRegionExtensionConfiguration) => {
		return { region: awsRegionExtensionConfiguration.region() };
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/client/index.js
var init_client = __esmMin((() => {
	init_emitWarningIfUnsupportedVersion$1();
	init_setCredentialFeature();
	init_setFeature();
	init_hostHeaderMiddleware();
	init_loggerMiddleware();
	init_configuration();
	init_getRecursionDetectionPlugin();
	init_recursionDetectionMiddleware();
	init_configurations();
	init_user_agent_middleware();
	init_defaultUserAgent();
	init_nodeAppIdConfigOptions();
	init_aws();
	init_endpoints();
	init_protocols$1();
	init_isIpAddress();
	init_isVirtualHostableS3Bucket();
	init_parseArn();
	init_partition();
	init_config$1();
	init_stsRegionDefaultResolver();
	init_extensions();
}));
//#endregion
//#region ../../node_modules/@aws-sdk/checksums/dist-es/submodules/flexible-checksums/getChecksumAlgorithmForRequest.js
var getChecksumAlgorithmForRequest = (input, { requestChecksumRequired, requestAlgorithmMember, requestChecksumCalculation }) => {
	if (!requestAlgorithmMember) return requestChecksumCalculation === RequestChecksumCalculation.WHEN_SUPPORTED || requestChecksumRequired ? DEFAULT_CHECKSUM_ALGORITHM : void 0;
	if (!input[requestAlgorithmMember]) return;
	return input[requestAlgorithmMember];
};
//#endregion
//#region ../../node_modules/@aws-sdk/checksums/dist-es/submodules/flexible-checksums/getChecksumLocationName.js
var getChecksumLocationName = (algorithm) => algorithm === ChecksumAlgorithm.MD5 ? "content-md5" : `x-amz-checksum-${algorithm.toLowerCase()}`;
//#endregion
//#region ../../node_modules/@aws-sdk/checksums/dist-es/submodules/flexible-checksums/hasHeader.js
var hasHeader$1 = (header, headers) => {
	const soughtHeader = header.toLowerCase();
	for (const headerName of Object.keys(headers)) if (soughtHeader === headerName.toLowerCase()) return true;
	return false;
};
//#endregion
//#region ../../node_modules/@aws-sdk/checksums/dist-es/submodules/flexible-checksums/hasHeaderWithPrefix.js
var hasHeaderWithPrefix = (headerPrefix, headers) => {
	const soughtHeaderPrefix = headerPrefix.toLowerCase();
	for (const headerName of Object.keys(headers)) if (headerName.toLowerCase().startsWith(soughtHeaderPrefix)) return true;
	return false;
};
//#endregion
//#region ../../node_modules/@aws-sdk/checksums/dist-es/submodules/flexible-checksums/isStreaming.js
init_serde();
var isStreaming = (body) => body !== void 0 && typeof body !== "string" && !ArrayBuffer.isView(body) && !isArrayBuffer(body);
//#endregion
//#region ../../node_modules/@aws-sdk/checksums/dist-es/submodules/crc/crc32c/Crc32cJs.js
var T$1 = /* @__PURE__ */ new Uint32Array(256);
for (let i = 0; i < 256; ++i) {
	let c = i;
	for (let j = 0; j < 8; ++j) c = c & 1 ? 2197175160 ^ c >>> 1 : c >>> 1;
	T$1[i] = c >>> 0;
}
var Crc32cJs = class {
	digestLength = 4;
	crc = 4294967295;
	update(data) {
		let crc = this.crc;
		for (let i = 0; i < data.length; ++i) crc = crc >>> 8 ^ T$1[(crc ^ data[i]) & 255];
		this.crc = crc;
	}
	async digest() {
		const value = (this.crc ^ 4294967295) >>> 0;
		const out = /* @__PURE__ */ new Uint8Array(4);
		out[0] = value >>> 24;
		out[1] = value >>> 16 & 255;
		out[2] = value >>> 8 & 255;
		out[3] = value & 255;
		return out;
	}
	reset() {
		this.crc = 4294967295;
	}
};
//#endregion
//#region ../../node_modules/@aws-sdk/checksums/dist-es/submodules/crc/crc32c/Crc32cNode.js
var Crc32cNode = Crc32cJs;
//#endregion
//#region ../../node_modules/@aws-sdk/checksums/dist-es/submodules/crc/crc64-nvme/crc64-nvme-crt-container.js
var crc64NvmeCrtContainer = { CrtCrc64Nvme: null };
//#endregion
//#region ../../node_modules/@aws-sdk/checksums/dist-es/submodules/crc/crc64-nvme/Crc64NvmeJs.js
var generateCRC64NVMETable = () => {
	const sliceLength = 8;
	const tables = new Array(sliceLength);
	for (let slice = 0; slice < sliceLength; slice++) {
		const table = new Array(512);
		for (let i = 0; i < 256; i++) {
			let crc = BigInt(i);
			for (let j = 0; j < 8 * (slice + 1); j++) if (crc & 1n) crc = crc >> 1n ^ 11127430586519243189n;
			else crc = crc >> 1n;
			table[i * 2] = Number(crc >> 32n & 4294967295n);
			table[i * 2 + 1] = Number(crc & 4294967295n);
		}
		tables[slice] = new Uint32Array(table);
	}
	return tables;
};
var CRC64_NVME_REVERSED_TABLE;
var t0;
var t1;
var t2;
var t3;
var t4;
var t5;
var t6;
var t7;
var ensureTablesInitialized = () => {
	if (!CRC64_NVME_REVERSED_TABLE) {
		CRC64_NVME_REVERSED_TABLE = generateCRC64NVMETable();
		[t0, t1, t2, t3, t4, t5, t6, t7] = CRC64_NVME_REVERSED_TABLE;
	}
};
var Crc64NvmeJs = class {
	c1 = 0;
	c2 = 0;
	constructor() {
		ensureTablesInitialized();
		this.reset();
	}
	update(data) {
		const len = data.length;
		let i = 0;
		let crc1 = this.c1;
		let crc2 = this.c2;
		while (i + 8 <= len) {
			const idx0 = ((crc2 ^ data[i++]) & 255) << 1;
			const idx1 = ((crc2 >>> 8 ^ data[i++]) & 255) << 1;
			const idx2 = ((crc2 >>> 16 ^ data[i++]) & 255) << 1;
			const idx3 = ((crc2 >>> 24 ^ data[i++]) & 255) << 1;
			const idx4 = ((crc1 ^ data[i++]) & 255) << 1;
			const idx5 = ((crc1 >>> 8 ^ data[i++]) & 255) << 1;
			const idx6 = ((crc1 >>> 16 ^ data[i++]) & 255) << 1;
			const idx7 = ((crc1 >>> 24 ^ data[i++]) & 255) << 1;
			crc1 = t7[idx0] ^ t6[idx1] ^ t5[idx2] ^ t4[idx3] ^ t3[idx4] ^ t2[idx5] ^ t1[idx6] ^ t0[idx7];
			crc2 = t7[idx0 + 1] ^ t6[idx1 + 1] ^ t5[idx2 + 1] ^ t4[idx3 + 1] ^ t3[idx4 + 1] ^ t2[idx5 + 1] ^ t1[idx6 + 1] ^ t0[idx7 + 1];
		}
		while (i < len) {
			const idx = ((crc2 ^ data[i]) & 255) << 1;
			crc2 = (crc2 >>> 8 | (crc1 & 255) << 24) >>> 0;
			crc1 = crc1 >>> 8 ^ t0[idx];
			crc2 ^= t0[idx + 1];
			++i;
		}
		this.c1 = crc1;
		this.c2 = crc2;
	}
	async digest() {
		const c1 = this.c1 ^ 4294967295;
		const c2 = this.c2 ^ 4294967295;
		return new Uint8Array([
			c1 >>> 24,
			c1 >>> 16 & 255,
			c1 >>> 8 & 255,
			c1 & 255,
			c2 >>> 24,
			c2 >>> 16 & 255,
			c2 >>> 8 & 255,
			c2 & 255
		]);
	}
	reset() {
		this.c1 = 4294967295;
		this.c2 = 4294967295;
	}
};
//#endregion
//#region ../../node_modules/@aws-sdk/checksums/dist-es/submodules/crc/crc64-nvme/Crc64Nvme.js
var Crc64Nvme = class {
	impl;
	constructor() {
		const Crt = crc64NvmeCrtContainer.CrtCrc64Nvme;
		this.impl = Crt ? new Crt() : new Crc64NvmeJs();
	}
	update(data) {
		this.impl.update(data);
	}
	async digest() {
		return this.impl.digest();
	}
	reset() {
		this.impl.reset();
	}
};
//#endregion
//#region ../../node_modules/@aws-sdk/checksums/dist-es/submodules/flexible-checksums/types.js
var CLIENT_SUPPORTED_ALGORITHMS = [
	ChecksumAlgorithm.CRC32,
	ChecksumAlgorithm.CRC32C,
	ChecksumAlgorithm.CRC64NVME,
	ChecksumAlgorithm.SHA1,
	ChecksumAlgorithm.SHA256
];
var PRIORITY_ORDER_ALGORITHMS = [
	ChecksumAlgorithm.SHA256,
	ChecksumAlgorithm.SHA1,
	ChecksumAlgorithm.CRC32,
	ChecksumAlgorithm.CRC32C,
	ChecksumAlgorithm.CRC64NVME
];
//#endregion
//#region ../../node_modules/@aws-sdk/checksums/dist-es/submodules/flexible-checksums/selectChecksumAlgorithmFunction.js
init_Crc32Node();
var selectChecksumAlgorithmFunction = (checksumAlgorithm, config) => {
	const { checksumAlgorithms = {} } = config;
	switch (checksumAlgorithm) {
		case ChecksumAlgorithm.MD5: return checksumAlgorithms?.MD5 ?? config.md5;
		case ChecksumAlgorithm.CRC32: return checksumAlgorithms?.CRC32 ?? Crc32Node;
		case ChecksumAlgorithm.CRC32C: return checksumAlgorithms?.CRC32C ?? Crc32cNode;
		case ChecksumAlgorithm.CRC64NVME: return checksumAlgorithms?.CRC64NVME ?? Crc64Nvme;
		case ChecksumAlgorithm.SHA1: return checksumAlgorithms?.SHA1 ?? config.sha1;
		case ChecksumAlgorithm.SHA256: return checksumAlgorithms?.SHA256 ?? config.sha256;
		default:
			if (checksumAlgorithms?.[checksumAlgorithm]) return checksumAlgorithms[checksumAlgorithm];
			throw new Error(`The checksum algorithm "${checksumAlgorithm}" is not supported by the client. Select one of ${CLIENT_SUPPORTED_ALGORITHMS}, or provide an implementation to  the client constructor checksums field.`);
	}
};
//#endregion
//#region ../../node_modules/@aws-sdk/checksums/dist-es/submodules/flexible-checksums/stringHasher.js
init_serde();
var stringHasher = (checksumAlgorithmFn, body) => {
	const hash = new checksumAlgorithmFn();
	hash.update(toUint8Array(body || ""));
	return hash.digest();
};
//#endregion
//#region ../../node_modules/@aws-sdk/checksums/dist-es/submodules/flexible-checksums/flexibleChecksumsMiddleware.js
init_client();
init_protocols$1();
init_serde();
var flexibleChecksumsMiddlewareOptions = {
	name: "flexibleChecksumsMiddleware",
	step: "build",
	tags: ["BODY_CHECKSUM"],
	override: true
};
var flexibleChecksumsMiddleware = (config, middlewareConfig) => (next, context) => async (args) => {
	if (!HttpRequest.isInstance(args.request)) return next(args);
	if (hasHeaderWithPrefix("x-amz-checksum-", args.request.headers)) return next(args);
	const { request, input } = args;
	const { body: requestBody, headers } = request;
	const { base64Encoder, streamHasher } = config;
	const { requestChecksumRequired, requestAlgorithmMember } = middlewareConfig;
	const requestChecksumCalculation = await config.requestChecksumCalculation();
	const requestAlgorithmMemberName = requestAlgorithmMember?.name;
	const requestAlgorithmMemberHttpHeader = requestAlgorithmMember?.httpHeader;
	if (requestAlgorithmMemberName && !input[requestAlgorithmMemberName]) {
		if (requestChecksumCalculation === RequestChecksumCalculation.WHEN_SUPPORTED || requestChecksumRequired) {
			input[requestAlgorithmMemberName] = DEFAULT_CHECKSUM_ALGORITHM;
			if (requestAlgorithmMemberHttpHeader) headers[requestAlgorithmMemberHttpHeader] = DEFAULT_CHECKSUM_ALGORITHM;
		}
	}
	const checksumAlgorithm = getChecksumAlgorithmForRequest(input, {
		requestChecksumRequired,
		requestAlgorithmMember: requestAlgorithmMember?.name,
		requestChecksumCalculation
	});
	let updatedBody = requestBody;
	let updatedHeaders = headers;
	if (checksumAlgorithm) {
		switch (checksumAlgorithm) {
			case ChecksumAlgorithm.CRC32:
				setFeature(context, "FLEXIBLE_CHECKSUMS_REQ_CRC32", "U");
				break;
			case ChecksumAlgorithm.CRC32C:
				setFeature(context, "FLEXIBLE_CHECKSUMS_REQ_CRC32C", "V");
				break;
			case ChecksumAlgorithm.CRC64NVME:
				setFeature(context, "FLEXIBLE_CHECKSUMS_REQ_CRC64", "W");
				break;
			case ChecksumAlgorithm.SHA1:
				setFeature(context, "FLEXIBLE_CHECKSUMS_REQ_SHA1", "X");
				break;
			case ChecksumAlgorithm.SHA256: setFeature(context, "FLEXIBLE_CHECKSUMS_REQ_SHA256", "Y");
		}
		const checksumLocationName = getChecksumLocationName(checksumAlgorithm);
		const checksumAlgorithmFn = selectChecksumAlgorithmFunction(checksumAlgorithm, config);
		if (isStreaming(requestBody)) {
			const { getAwsChunkedEncodingStream, bodyLengthChecker } = config;
			updatedBody = getAwsChunkedEncodingStream(typeof config.requestStreamBufferSize === "number" && config.requestStreamBufferSize >= 8192 ? createBufferedReadable(requestBody, config.requestStreamBufferSize, context.logger) : requestBody, {
				base64Encoder,
				bodyLengthChecker,
				checksumLocationName,
				checksumAlgorithmFn,
				streamHasher
			});
			updatedHeaders = {
				...headers,
				"content-encoding": headers["content-encoding"] ? `${headers["content-encoding"]},aws-chunked` : "aws-chunked",
				"transfer-encoding": "chunked",
				"x-amz-decoded-content-length": headers["content-length"],
				"x-amz-content-sha256": "STREAMING-UNSIGNED-PAYLOAD-TRAILER",
				"x-amz-trailer": checksumLocationName
			};
			delete updatedHeaders["content-length"];
		} else if (!hasHeader$1(checksumLocationName, headers)) {
			const rawChecksum = await stringHasher(checksumAlgorithmFn, requestBody);
			updatedHeaders = {
				...headers,
				[checksumLocationName]: base64Encoder(rawChecksum)
			};
		}
	}
	try {
		return await next({
			...args,
			request: {
				...request,
				headers: updatedHeaders,
				body: updatedBody
			}
		});
	} catch (e) {
		if (e instanceof Error && e.name === "InvalidChunkSizeError") try {
			if (!e.message.endsWith(".")) e.message += ".";
			e.message += " Set [requestStreamBufferSize=number e.g. 65_536] in client constructor to instruct AWS SDK to buffer your input stream.";
		} catch (ignored) {}
		throw e;
	}
};
//#endregion
//#region ../../node_modules/@aws-sdk/checksums/dist-es/submodules/flexible-checksums/flexibleChecksumsInputMiddleware.js
init_client();
var flexibleChecksumsInputMiddlewareOptions = {
	name: "flexibleChecksumsInputMiddleware",
	toMiddleware: "serializerMiddleware",
	relation: "before",
	tags: ["BODY_CHECKSUM"],
	override: true
};
var flexibleChecksumsInputMiddleware = (config, middlewareConfig) => (next, context) => async (args) => {
	const input = args.input;
	const { requestValidationModeMember } = middlewareConfig;
	const requestChecksumCalculation = await config.requestChecksumCalculation();
	const responseChecksumValidation = await config.responseChecksumValidation();
	switch (requestChecksumCalculation) {
		case RequestChecksumCalculation.WHEN_REQUIRED:
			setFeature(context, "FLEXIBLE_CHECKSUMS_REQ_WHEN_REQUIRED", "a");
			break;
		case RequestChecksumCalculation.WHEN_SUPPORTED: setFeature(context, "FLEXIBLE_CHECKSUMS_REQ_WHEN_SUPPORTED", "Z");
	}
	switch (responseChecksumValidation) {
		case ResponseChecksumValidation.WHEN_REQUIRED:
			setFeature(context, "FLEXIBLE_CHECKSUMS_RES_WHEN_REQUIRED", "c");
			break;
		case ResponseChecksumValidation.WHEN_SUPPORTED: setFeature(context, "FLEXIBLE_CHECKSUMS_RES_WHEN_SUPPORTED", "b");
	}
	if (requestValidationModeMember && !input[requestValidationModeMember]) {
		if (responseChecksumValidation === ResponseChecksumValidation.WHEN_SUPPORTED) input[requestValidationModeMember] = "ENABLED";
	}
	return next(args);
};
//#endregion
//#region ../../node_modules/@aws-sdk/checksums/dist-es/submodules/flexible-checksums/getChecksumAlgorithmListForResponse.js
var getChecksumAlgorithmListForResponse = (responseAlgorithms = []) => {
	const validChecksumAlgorithms = [];
	let i = PRIORITY_ORDER_ALGORITHMS.length;
	for (const algorithm of responseAlgorithms) {
		const priority = PRIORITY_ORDER_ALGORITHMS.indexOf(algorithm);
		if (priority !== -1) validChecksumAlgorithms[priority] = algorithm;
		else validChecksumAlgorithms[i++] = algorithm;
	}
	return validChecksumAlgorithms.filter(Boolean);
};
//#endregion
//#region ../../node_modules/@aws-sdk/checksums/dist-es/submodules/flexible-checksums/isChecksumWithPartNumber.js
var isChecksumWithPartNumber = (checksum) => {
	const lastHyphenIndex = checksum.lastIndexOf("-");
	if (lastHyphenIndex !== -1) {
		const numberPart = checksum.slice(lastHyphenIndex + 1);
		if (!numberPart.startsWith("0")) {
			const number = parseInt(numberPart, 10);
			if (!isNaN(number) && number >= 1 && number <= 1e4) return true;
		}
	}
	return false;
};
//#endregion
//#region ../../node_modules/@aws-sdk/checksums/dist-es/submodules/flexible-checksums/getChecksum.js
var getChecksum = async (body, { checksumAlgorithmFn, base64Encoder }) => base64Encoder(await stringHasher(checksumAlgorithmFn, body));
//#endregion
//#region ../../node_modules/@aws-sdk/checksums/dist-es/submodules/flexible-checksums/validateChecksumFromResponse.js
init_serde();
var validateChecksumFromResponse = async (response, { config, responseAlgorithms, logger }) => {
	const checksumAlgorithms = getChecksumAlgorithmListForResponse(responseAlgorithms);
	const { body: responseBody, headers: responseHeaders } = response;
	for (const algorithm of checksumAlgorithms) {
		const responseHeader = getChecksumLocationName(algorithm);
		const checksumFromResponse = responseHeaders[responseHeader];
		if (checksumFromResponse) {
			let checksumAlgorithmFn;
			try {
				checksumAlgorithmFn = selectChecksumAlgorithmFunction(algorithm, config);
			} catch (error) {
				if (algorithm === ChecksumAlgorithm.CRC64NVME) {
					logger?.warn(`Skipping ${ChecksumAlgorithm.CRC64NVME} checksum validation: ${error.message}`);
					continue;
				}
				throw error;
			}
			const { base64Encoder } = config;
			if (isStreaming(responseBody)) {
				response.body = createChecksumStream({
					expectedChecksum: checksumFromResponse,
					checksumSourceLocation: responseHeader,
					checksum: new checksumAlgorithmFn(),
					source: responseBody,
					base64Encoder
				});
				return;
			}
			const checksum = await getChecksum(responseBody, {
				checksumAlgorithmFn,
				base64Encoder
			});
			if (checksum === checksumFromResponse) break;
			throw new Error(`Checksum mismatch: expected "${checksum}" but received "${checksumFromResponse}" in response header "${responseHeader}".`);
		}
	}
};
//#endregion
//#region ../../node_modules/@aws-sdk/checksums/dist-es/submodules/flexible-checksums/flexibleChecksumsResponseMiddleware.js
init_protocols$1();
var flexibleChecksumsResponseMiddlewareOptions = {
	name: "flexibleChecksumsResponseMiddleware",
	toMiddleware: "deserializerMiddleware",
	relation: "after",
	tags: ["BODY_CHECKSUM"],
	override: true
};
var flexibleChecksumsResponseMiddleware = (config, middlewareConfig) => (next, context) => async (args) => {
	if (!HttpRequest.isInstance(args.request)) return next(args);
	const input = args.input;
	const result = await next(args);
	const response = result.response;
	const { requestValidationModeMember, responseAlgorithms } = middlewareConfig;
	if (requestValidationModeMember && input[requestValidationModeMember] === "ENABLED") {
		const { clientName, commandName } = context;
		const customChecksumAlgorithms = Object.keys(config.checksumAlgorithms ?? {}).filter((algorithm) => {
			const responseHeader = getChecksumLocationName(algorithm);
			return response.headers[responseHeader] !== void 0;
		});
		const algoList = getChecksumAlgorithmListForResponse([...responseAlgorithms ?? [], ...customChecksumAlgorithms]);
		if (clientName === "S3Client" && commandName === "GetObjectCommand" && algoList.every((algorithm) => {
			const responseHeader = getChecksumLocationName(algorithm);
			const checksumFromResponse = response.headers[responseHeader];
			return !checksumFromResponse || isChecksumWithPartNumber(checksumFromResponse);
		})) return result;
		await validateChecksumFromResponse(response, {
			config,
			responseAlgorithms: algoList,
			logger: context.logger
		});
	}
	return result;
};
//#endregion
//#region ../../node_modules/@aws-sdk/checksums/dist-es/submodules/flexible-checksums/getFlexibleChecksumsPlugin.js
var getFlexibleChecksumsPlugin = (config, middlewareConfig) => ({ applyToStack: (clientStack) => {
	clientStack.add(flexibleChecksumsMiddleware(config, middlewareConfig), flexibleChecksumsMiddlewareOptions);
	clientStack.addRelativeTo(flexibleChecksumsInputMiddleware(config, middlewareConfig), flexibleChecksumsInputMiddlewareOptions);
	clientStack.addRelativeTo(flexibleChecksumsResponseMiddleware(config, middlewareConfig), flexibleChecksumsResponseMiddlewareOptions);
} });
//#endregion
//#region ../../node_modules/@aws-sdk/checksums/dist-es/submodules/flexible-checksums/resolveFlexibleChecksumsConfig.js
init_client$1();
var resolveFlexibleChecksumsConfig = (input) => {
	const { requestChecksumCalculation, responseChecksumValidation, requestStreamBufferSize } = input;
	return Object.assign(input, {
		requestChecksumCalculation: normalizeProvider$1(requestChecksumCalculation ?? DEFAULT_REQUEST_CHECKSUM_CALCULATION),
		responseChecksumValidation: normalizeProvider$1(responseChecksumValidation ?? DEFAULT_RESPONSE_CHECKSUM_VALIDATION),
		requestStreamBufferSize: Number(requestStreamBufferSize ?? 0),
		checksumAlgorithms: input.checksumAlgorithms ?? {}
	});
};
//#endregion
//#region ../../node_modules/@aws-sdk/middleware-sdk-s3/dist-es/submodules/s3/middleware-check-content-length-header/check-content-length-header.js
init_client$1();
init_protocols$1();
var CONTENT_LENGTH_HEADER = "content-length";
var DECODED_CONTENT_LENGTH_HEADER = "x-amz-decoded-content-length";
function checkContentLengthHeader() {
	return (next, context) => async (args) => {
		const { request } = args;
		if (HttpRequest.isInstance(request)) {
			if (!(CONTENT_LENGTH_HEADER in request.headers) && !(DECODED_CONTENT_LENGTH_HEADER in request.headers)) {
				const message = `Are you using a Stream of unknown length as the Body of a PutObject request? Consider using Upload instead from @aws-sdk/lib-storage.`;
				if (typeof context?.logger?.warn === "function" && !(context.logger instanceof NoOpLogger)) context.logger.warn(message);
				else console.warn(message);
			}
		}
		return next({ ...args });
	};
}
var checkContentLengthHeaderMiddlewareOptions = {
	step: "finalizeRequest",
	tags: ["CHECK_CONTENT_LENGTH_HEADER"],
	name: "getCheckContentLengthHeaderPlugin",
	override: true
};
var getCheckContentLengthHeaderPlugin = (unused) => ({ applyToStack: (clientStack) => {
	clientStack.add(checkContentLengthHeader(), checkContentLengthHeaderMiddlewareOptions);
} });
//#endregion
//#region ../../node_modules/@aws-sdk/middleware-sdk-s3/dist-es/submodules/s3/middleware-region-redirect/region-redirect-endpoint-middleware.js
var regionRedirectEndpointMiddleware = (config) => {
	return (next, context) => async (args) => {
		const originalRegion = await config.region();
		const regionProviderRef = config.region;
		let unlock = () => {};
		if (context.__s3RegionRedirect) {
			Object.defineProperty(config, "region", {
				writable: false,
				value: async () => {
					return context.__s3RegionRedirect;
				}
			});
			unlock = () => Object.defineProperty(config, "region", {
				writable: true,
				value: regionProviderRef
			});
		}
		try {
			const result = await next(args);
			if (context.__s3RegionRedirect) {
				unlock();
				if (originalRegion !== await config.region()) throw new Error("Region was not restored following S3 region redirect.");
			}
			return result;
		} catch (e) {
			unlock();
			throw e;
		}
	};
};
var regionRedirectEndpointMiddlewareOptions = {
	tags: ["REGION_REDIRECT", "S3"],
	name: "regionRedirectEndpointMiddleware",
	override: true,
	relation: "before",
	toMiddleware: "endpointV2Middleware"
};
//#endregion
//#region ../../node_modules/@aws-sdk/middleware-sdk-s3/dist-es/submodules/s3/middleware-region-redirect/region-redirect-middleware.js
init_client();
function regionRedirectMiddleware(clientConfig) {
	return (next, context) => async (args) => {
		try {
			return await next(args);
		} catch (err) {
			if (clientConfig.followRegionRedirects) {
				const statusCode = err?.$metadata?.httpStatusCode;
				const isHeadBucket = context.commandName === "HeadBucketCommand";
				const bucketRegionHeader = err?.$response?.headers?.["x-amz-bucket-region"];
				if (bucketRegionHeader) {
					if (statusCode === 301 || statusCode === 400 && (err?.name === "IllegalLocationConstraintException" || isHeadBucket)) {
						try {
							const actualRegion = bucketRegionHeader;
							context.logger?.debug(`Redirecting from ${await clientConfig.region()} to ${actualRegion}`);
							context.__s3RegionRedirect = actualRegion;
							setFeature(context, "S3_REGION_REDIRECT", "Ah");
						} catch (e) {
							throw new Error("Region redirect failed: " + e);
						}
						return next(args);
					}
				}
			}
			throw err;
		}
	};
}
var regionRedirectMiddlewareOptions = {
	step: "initialize",
	tags: ["REGION_REDIRECT", "S3"],
	name: "regionRedirectMiddleware",
	override: true
};
var getRegionRedirectMiddlewarePlugin = (clientConfig) => ({ applyToStack: (clientStack) => {
	clientStack.add(regionRedirectMiddleware(clientConfig), regionRedirectMiddlewareOptions);
	clientStack.addRelativeTo(regionRedirectEndpointMiddleware(clientConfig), regionRedirectEndpointMiddlewareOptions);
} });
//#endregion
//#region ../../node_modules/@aws-sdk/middleware-sdk-s3/dist-es/submodules/s3/middleware-s3-express/classes/S3ExpressIdentityCache.js
var S3ExpressIdentityCache = class S3ExpressIdentityCache {
	data;
	lastPurgeTime = Date.now();
	static EXPIRED_CREDENTIAL_PURGE_INTERVAL_MS = 3e4;
	constructor(data = {}) {
		this.data = data;
	}
	get(key) {
		const entry = this.data[key];
		if (!entry) return;
		return entry;
	}
	set(key, entry) {
		this.data[key] = entry;
		return entry;
	}
	delete(key) {
		delete this.data[key];
	}
	async purgeExpired() {
		const now = Date.now();
		if (this.lastPurgeTime + S3ExpressIdentityCache.EXPIRED_CREDENTIAL_PURGE_INTERVAL_MS > now) return;
		for (const key in this.data) {
			const entry = this.data[key];
			if (!entry.isRefreshing) {
				const credential = await entry.identity;
				if (credential.expiration) {
					if (credential.expiration.getTime() < now) delete this.data[key];
				}
			}
		}
	}
};
//#endregion
//#region ../../node_modules/@aws-sdk/middleware-sdk-s3/dist-es/submodules/s3/middleware-s3-express/classes/S3ExpressIdentityCacheEntry.js
var S3ExpressIdentityCacheEntry = class {
	_identity;
	isRefreshing;
	accessed;
	constructor(_identity, isRefreshing = false, accessed = Date.now()) {
		this._identity = _identity;
		this.isRefreshing = isRefreshing;
		this.accessed = accessed;
	}
	get identity() {
		this.accessed = Date.now();
		return this._identity;
	}
};
//#endregion
//#region ../../node_modules/@aws-sdk/middleware-sdk-s3/dist-es/submodules/s3/middleware-s3-express/classes/S3ExpressIdentityProviderImpl.js
var S3ExpressIdentityProviderImpl = class S3ExpressIdentityProviderImpl {
	createSessionFn;
	cache;
	static REFRESH_WINDOW_MS = 6e4;
	constructor(createSessionFn, cache = new S3ExpressIdentityCache()) {
		this.createSessionFn = createSessionFn;
		this.cache = cache;
	}
	async getS3ExpressIdentity(awsIdentity, identityProperties) {
		const key = identityProperties.Bucket;
		const { cache } = this;
		const entry = cache.get(key);
		if (entry) return entry.identity.then((identity) => {
			if ((identity.expiration?.getTime() ?? 0) < Date.now()) return cache.set(key, new S3ExpressIdentityCacheEntry(this.getIdentity(key))).identity;
			if ((identity.expiration?.getTime() ?? 0) < Date.now() + S3ExpressIdentityProviderImpl.REFRESH_WINDOW_MS && !entry.isRefreshing) {
				entry.isRefreshing = true;
				this.getIdentity(key).then((id) => {
					cache.set(key, new S3ExpressIdentityCacheEntry(Promise.resolve(id)));
				});
			}
			return identity;
		});
		return cache.set(key, new S3ExpressIdentityCacheEntry(this.getIdentity(key))).identity;
	}
	async getIdentity(key) {
		await this.cache.purgeExpired().catch((error) => {
			console.warn("Error while clearing expired entries in S3ExpressIdentityCache: \n" + error);
		});
		const session = await this.createSessionFn(key);
		if (!session.Credentials?.AccessKeyId || !session.Credentials?.SecretAccessKey) throw new Error("s3#createSession response credential missing AccessKeyId or SecretAccessKey.");
		return {
			accessKeyId: session.Credentials.AccessKeyId,
			secretAccessKey: session.Credentials.SecretAccessKey,
			sessionToken: session.Credentials.SessionToken,
			expiration: session.Credentials.Expiration ? new Date(session.Credentials.Expiration) : void 0
		};
	}
};
//#endregion
//#region ../../node_modules/@aws-sdk/middleware-sdk-s3/dist-es/submodules/s3/middleware-s3-configuration/s3Configuration.js
var resolveS3Config = (input, { session }) => {
	const [s3ClientProvider, CreateSessionCommandCtor] = session;
	const { forcePathStyle, useAccelerateEndpoint, disableMultiregionAccessPoints, followRegionRedirects, s3ExpressIdentityProvider, bucketEndpoint, expectContinueHeader } = input;
	return Object.assign(input, {
		forcePathStyle: forcePathStyle ?? false,
		useAccelerateEndpoint: useAccelerateEndpoint ?? false,
		disableMultiregionAccessPoints: disableMultiregionAccessPoints ?? false,
		followRegionRedirects: followRegionRedirects ?? false,
		s3ExpressIdentityProvider: s3ExpressIdentityProvider ?? new S3ExpressIdentityProviderImpl(async (key) => s3ClientProvider().send(new CreateSessionCommandCtor({ Bucket: key }))),
		bucketEndpoint: bucketEndpoint ?? false,
		expectContinueHeader: expectContinueHeader ?? 2097152
	});
};
//#endregion
//#region ../../node_modules/@aws-sdk/middleware-sdk-s3/dist-es/submodules/s3/middleware-s3-expires/s3-expires-middleware.js
init_protocols$1();
init_serde();
var s3ExpiresMiddleware = (config) => {
	return (next, context) => async (args) => {
		const result = await next(args);
		const { response } = result;
		if (HttpResponse.isInstance(response)) {
			if (response.headers.expires) {
				response.headers.expiresstring = response.headers.expires;
				try {
					parseRfc7231DateTime(response.headers.expires);
				} catch (e) {
					context.logger?.warn(`AWS SDK Warning for ${context.clientName}::${context.commandName} response parsing (${response.headers.expires}): ${e}`);
					delete response.headers.expires;
				}
			}
		}
		return result;
	};
};
var s3ExpiresMiddlewareOptions = {
	tags: ["S3"],
	name: "s3ExpiresMiddleware",
	override: true,
	relation: "after",
	toMiddleware: "deserializerMiddleware"
};
var getS3ExpiresMiddlewarePlugin = (clientConfig) => ({ applyToStack: (clientStack) => {
	clientStack.addRelativeTo(s3ExpiresMiddleware(clientConfig), s3ExpiresMiddlewareOptions);
} });
//#endregion
//#region ../../node_modules/@smithy/signature-v4/dist-es/HeaderFormatter.js
function negate(bytes) {
	for (let i = 0; i < 8; i++) bytes[i] ^= 255;
	for (let i = 7; i > -1; i--) {
		bytes[i]++;
		if (bytes[i] !== 0) break;
	}
}
var HeaderFormatter, HEADER_VALUE_TYPE, UUID_PATTERN, Int64;
var init_HeaderFormatter = __esmMin((() => {
	init_serde();
	HeaderFormatter = class {
		format(headers) {
			const chunks = [];
			for (const headerName in headers) {
				if (!hasOwn(headers, headerName)) continue;
				const bytes = fromUtf8$1(headerName);
				chunks.push(Uint8Array.from([bytes.byteLength]), bytes, this.formatHeaderValue(headers[headerName]));
			}
			const out = new Uint8Array(chunks.reduce((carry, bytes) => carry + bytes.byteLength, 0));
			let position = 0;
			for (const chunk of chunks) {
				out.set(chunk, position);
				position += chunk.byteLength;
			}
			return out;
		}
		formatHeaderValue(header) {
			switch (header.type) {
				case "boolean": return Uint8Array.from([header.value ? 0 : 1]);
				case "byte": return Uint8Array.from([2, header.value]);
				case "short":
					const shortView = /* @__PURE__ */ new DataView(/* @__PURE__ */ new ArrayBuffer(3));
					shortView.setUint8(0, 3);
					shortView.setInt16(1, header.value, false);
					return new Uint8Array(shortView.buffer);
				case "integer":
					const intView = /* @__PURE__ */ new DataView(/* @__PURE__ */ new ArrayBuffer(5));
					intView.setUint8(0, 4);
					intView.setInt32(1, header.value, false);
					return new Uint8Array(intView.buffer);
				case "long":
					const longBytes = /* @__PURE__ */ new Uint8Array(9);
					longBytes[0] = 5;
					longBytes.set(header.value.bytes, 1);
					return longBytes;
				case "binary":
					const binView = new DataView(new ArrayBuffer(3 + header.value.byteLength));
					binView.setUint8(0, 6);
					binView.setUint16(1, header.value.byteLength, false);
					const binBytes = new Uint8Array(binView.buffer);
					binBytes.set(header.value, 3);
					return binBytes;
				case "string":
					const utf8Bytes = fromUtf8$1(header.value);
					const strView = new DataView(new ArrayBuffer(3 + utf8Bytes.byteLength));
					strView.setUint8(0, 7);
					strView.setUint16(1, utf8Bytes.byteLength, false);
					const strBytes = new Uint8Array(strView.buffer);
					strBytes.set(utf8Bytes, 3);
					return strBytes;
				case "timestamp":
					const tsBytes = /* @__PURE__ */ new Uint8Array(9);
					tsBytes[0] = 8;
					tsBytes.set(Int64.fromNumber(header.value.valueOf()).bytes, 1);
					return tsBytes;
				case "uuid":
					if (!UUID_PATTERN.test(header.value)) throw new Error(`Invalid UUID received: ${header.value}`);
					const uuidBytes = /* @__PURE__ */ new Uint8Array(17);
					uuidBytes[0] = 9;
					uuidBytes.set(fromHex(header.value.replace(/-/g, "")), 1);
					return uuidBytes;
			}
		}
	};
	(function(HEADER_VALUE_TYPE) {
		HEADER_VALUE_TYPE[HEADER_VALUE_TYPE["boolTrue"] = 0] = "boolTrue";
		HEADER_VALUE_TYPE[HEADER_VALUE_TYPE["boolFalse"] = 1] = "boolFalse";
		HEADER_VALUE_TYPE[HEADER_VALUE_TYPE["byte"] = 2] = "byte";
		HEADER_VALUE_TYPE[HEADER_VALUE_TYPE["short"] = 3] = "short";
		HEADER_VALUE_TYPE[HEADER_VALUE_TYPE["integer"] = 4] = "integer";
		HEADER_VALUE_TYPE[HEADER_VALUE_TYPE["long"] = 5] = "long";
		HEADER_VALUE_TYPE[HEADER_VALUE_TYPE["byteArray"] = 6] = "byteArray";
		HEADER_VALUE_TYPE[HEADER_VALUE_TYPE["string"] = 7] = "string";
		HEADER_VALUE_TYPE[HEADER_VALUE_TYPE["timestamp"] = 8] = "timestamp";
		HEADER_VALUE_TYPE[HEADER_VALUE_TYPE["uuid"] = 9] = "uuid";
	})(HEADER_VALUE_TYPE || (HEADER_VALUE_TYPE = {}));
	UUID_PATTERN = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
	Int64 = class Int64 {
		bytes;
		constructor(bytes) {
			this.bytes = bytes;
			if (bytes.byteLength !== 8) throw new Error("Int64 buffers must be exactly 8 bytes");
		}
		static fromNumber(number) {
			if (number > 0x8000000000000000 || number < -0x8000000000000000) throw new Error(`${number} is too large (or, if negative, too small) to represent as an Int64`);
			const bytes = /* @__PURE__ */ new Uint8Array(8);
			for (let i = 7, remaining = Math.abs(Math.round(number)); i > -1 && remaining > 0; i--, remaining /= 256) bytes[i] = remaining;
			if (number < 0) negate(bytes);
			return new Int64(bytes);
		}
		valueOf() {
			const bytes = this.bytes.slice(0);
			const negative = bytes[0] & 128;
			if (negative) negate(bytes);
			return parseInt(toHex(bytes), 16) * (negative ? -1 : 1);
		}
		toString() {
			return String(this.valueOf());
		}
	};
})), ALGORITHM_QUERY_PARAM, CREDENTIAL_QUERY_PARAM, AMZ_DATE_QUERY_PARAM, SIGNED_HEADERS_QUERY_PARAM, EXPIRES_QUERY_PARAM, SIGNATURE_QUERY_PARAM, TOKEN_QUERY_PARAM, AUTH_HEADER, AMZ_DATE_HEADER, DATE_HEADER, GENERATED_HEADERS, SHA256_HEADER, TOKEN_HEADER, ALWAYS_UNSIGNABLE_HEADERS, PROXY_HEADER_PATTERN, SEC_HEADER_PATTERN, ALGORITHM_IDENTIFIER, EVENT_ALGORITHM_IDENTIFIER, UNSIGNED_PAYLOAD, KEY_TYPE_IDENTIFIER;
var init_constants$2 = __esmMin((() => {
	ALGORITHM_QUERY_PARAM = "X-Amz-Algorithm";
	CREDENTIAL_QUERY_PARAM = "X-Amz-Credential";
	AMZ_DATE_QUERY_PARAM = "X-Amz-Date";
	SIGNED_HEADERS_QUERY_PARAM = "X-Amz-SignedHeaders";
	EXPIRES_QUERY_PARAM = "X-Amz-Expires";
	SIGNATURE_QUERY_PARAM = "X-Amz-Signature";
	TOKEN_QUERY_PARAM = "X-Amz-Security-Token";
	AUTH_HEADER = "authorization";
	AMZ_DATE_HEADER = AMZ_DATE_QUERY_PARAM.toLowerCase();
	DATE_HEADER = "date";
	GENERATED_HEADERS = [
		AUTH_HEADER,
		AMZ_DATE_HEADER,
		DATE_HEADER
	];
	SIGNATURE_QUERY_PARAM.toLowerCase();
	SHA256_HEADER = "x-amz-content-sha256";
	TOKEN_HEADER = TOKEN_QUERY_PARAM.toLowerCase();
	ALWAYS_UNSIGNABLE_HEADERS = {
		authorization: true,
		"cache-control": true,
		connection: true,
		expect: true,
		from: true,
		"keep-alive": true,
		"max-forwards": true,
		pragma: true,
		referer: true,
		te: true,
		trailer: true,
		"transfer-encoding": true,
		upgrade: true,
		"user-agent": true,
		"x-amzn-trace-id": true
	};
	PROXY_HEADER_PATTERN = /^proxy-/;
	SEC_HEADER_PATTERN = /^sec-/;
	ALGORITHM_IDENTIFIER = "AWS4-HMAC-SHA256";
	EVENT_ALGORITHM_IDENTIFIER = "AWS4-HMAC-SHA256-PAYLOAD";
	UNSIGNED_PAYLOAD = "UNSIGNED-PAYLOAD";
	KEY_TYPE_IDENTIFIER = "aws4_request";
}));
//#endregion
//#region ../../node_modules/@smithy/signature-v4/dist-es/getCanonicalQuery.js
var getCanonicalQuery;
var init_getCanonicalQuery = __esmMin((() => {
	init_serde();
	init_protocols$1();
	init_constants$2();
	getCanonicalQuery = ({ query = {} }) => {
		const keys = [];
		const serialized = {};
		for (const key in query) {
			if (!hasOwn(query, key)) continue;
			if (key.toLowerCase() === "x-amz-signature") continue;
			const encodedKey = escapeUri(key);
			keys.push(encodedKey);
			const value = query[key];
			if (typeof value === "string") serialized[encodedKey] = `${encodedKey}=${escapeUri(value)}`;
			else if (Array.isArray(value)) serialized[encodedKey] = value.slice(0).reduce((encoded, value) => encoded.concat([`${encodedKey}=${escapeUri(value)}`]), []).sort().join("&");
		}
		return keys.sort().map((key) => serialized[key]).filter((serialized) => serialized).join("&");
	};
}));
//#endregion
//#region ../../node_modules/@smithy/signature-v4/dist-es/utilDate.js
var iso8601, toDate;
var init_utilDate = __esmMin((() => {
	iso8601 = (time) => toDate(time).toISOString().replace(/\.\d{3}Z$/, "Z");
	toDate = (time) => {
		if (typeof time === "number") return /* @__PURE__ */ new Date(time * 1e3);
		if (typeof time === "string") {
			if (Number(time)) return /* @__PURE__ */ new Date(Number(time) * 1e3);
			return new Date(time);
		}
		return time;
	};
}));
//#endregion
//#region ../../node_modules/@smithy/signature-v4/dist-es/SignatureV4Base.js
var SignatureV4Base;
var init_SignatureV4Base = __esmMin((() => {
	init_client$1();
	init_protocols$1();
	init_serde();
	init_getCanonicalQuery();
	init_utilDate();
	SignatureV4Base = class {
		service;
		regionProvider;
		credentialProvider;
		sha256;
		uriEscapePath;
		applyChecksum;
		constructor({ applyChecksum, credentials, region, service, sha256, uriEscapePath = true }) {
			this.service = service;
			this.sha256 = sha256;
			this.uriEscapePath = uriEscapePath;
			this.applyChecksum = typeof applyChecksum === "boolean" ? applyChecksum : true;
			this.regionProvider = normalizeProvider$1(region);
			this.credentialProvider = normalizeProvider$1(credentials);
		}
		createCanonicalRequest(request, canonicalHeaders, payloadHash) {
			const sortedHeaders = Object.keys(canonicalHeaders).sort();
			return `${request.method}
${this.getCanonicalPath(request)}
${getCanonicalQuery(request)}
${sortedHeaders.map((name) => `${name}:${canonicalHeaders[name]}`).join("\n")}

${sortedHeaders.join(";")}
${payloadHash}`;
		}
		async createStringToSign(longDate, credentialScope, canonicalRequest, algorithmIdentifier) {
			const hash = new this.sha256();
			hash.update(toUint8Array(canonicalRequest));
			return `${algorithmIdentifier}
${longDate}
${credentialScope}
${toHex(await hash.digest())}`;
		}
		getCanonicalPath({ path }) {
			if (this.uriEscapePath) {
				const normalizedPathSegments = [];
				for (const pathSegment of path.split("/")) {
					if (pathSegment?.length === 0) continue;
					if (pathSegment === ".") continue;
					if (pathSegment === "..") normalizedPathSegments.pop();
					else normalizedPathSegments.push(pathSegment);
				}
				const normalizedPath = `${path?.startsWith("/") ? "/" : ""}${normalizedPathSegments.join("/")}${normalizedPathSegments.length > 0 && path?.endsWith("/") ? "/" : ""}`;
				return escapeUri(normalizedPath).replace(/%2F/g, "/");
			}
			return path;
		}
		validateResolvedCredentials(credentials) {
			if (typeof credentials !== "object" || typeof credentials.accessKeyId !== "string" || typeof credentials.secretAccessKey !== "string") throw new Error("Resolved credential object is not valid");
		}
		formatDate(now) {
			const longDate = iso8601(now).replace(/[-:]/g, "");
			return {
				longDate,
				shortDate: longDate.slice(0, 8)
			};
		}
		getCanonicalHeaderList(headers) {
			return Object.keys(headers).sort().join(";");
		}
	};
}));
//#endregion
//#region ../../node_modules/@smithy/signature-v4/dist-es/credentialDerivation.js
var signingKeyCache, cacheQueue, createScope, getSigningKey, hmac;
var init_credentialDerivation = __esmMin((() => {
	init_serde();
	init_constants$2();
	signingKeyCache = {};
	cacheQueue = [];
	createScope = (shortDate, region, service) => `${shortDate}/${region}/${service}/${KEY_TYPE_IDENTIFIER}`;
	getSigningKey = async (sha256Constructor, credentials, shortDate, region, service) => {
		const cacheKey = `${shortDate}:${region}:${service}:${toHex(await hmac(sha256Constructor, credentials.secretAccessKey, credentials.accessKeyId))}:${credentials.sessionToken}`;
		if (cacheKey in signingKeyCache) return signingKeyCache[cacheKey];
		cacheQueue.push(cacheKey);
		while (cacheQueue.length > 50) delete signingKeyCache[cacheQueue.shift()];
		let key = `AWS4${credentials.secretAccessKey}`;
		for (const signable of [
			shortDate,
			region,
			service,
			KEY_TYPE_IDENTIFIER
		]) key = await hmac(sha256Constructor, key, signable);
		return signingKeyCache[cacheKey] = key;
	};
	hmac = (ctor, secret, data) => {
		const hash = new ctor(secret);
		hash.update(toUint8Array(data));
		return hash.digest();
	};
}));
//#endregion
//#region ../../node_modules/@smithy/signature-v4/dist-es/getCanonicalHeaders.js
var getCanonicalHeaders;
var init_getCanonicalHeaders = __esmMin((() => {
	init_constants$2();
	getCanonicalHeaders = ({ headers }, unsignableHeaders, signableHeaders) => {
		const canonical = {};
		for (const headerName of Object.keys(headers).sort()) {
			if (headers[headerName] == void 0) continue;
			const canonicalHeaderName = headerName.toLowerCase();
			if (canonicalHeaderName in ALWAYS_UNSIGNABLE_HEADERS || unsignableHeaders?.has(canonicalHeaderName) || PROXY_HEADER_PATTERN.test(canonicalHeaderName) || SEC_HEADER_PATTERN.test(canonicalHeaderName)) {
				if (!signableHeaders || signableHeaders && !signableHeaders.has(canonicalHeaderName)) continue;
			}
			canonical[canonicalHeaderName] = headers[headerName].replace(/[\r\n]/g, " ").replace(/[ \t]+/g, " ").replace(/^ | $/g, "");
		}
		return canonical;
	};
}));
//#endregion
//#region ../../node_modules/@smithy/signature-v4/dist-es/getPayloadHash.js
var getPayloadHash;
var init_getPayloadHash = __esmMin((() => {
	init_serde();
	init_constants$2();
	getPayloadHash = async ({ headers, body }, hashConstructor) => {
		for (const headerName in headers) {
			if (!hasOwn(headers, headerName)) continue;
			if (headerName.toLowerCase() === "x-amz-content-sha256") return headers[headerName];
		}
		if (body == void 0) return "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
		else if (typeof body === "string" || ArrayBuffer.isView(body) || isArrayBuffer(body)) {
			const hashCtor = new hashConstructor();
			hashCtor.update(toUint8Array(body));
			return toHex(await hashCtor.digest());
		}
		return UNSIGNED_PAYLOAD;
	};
}));
//#endregion
//#region ../../node_modules/@smithy/signature-v4/dist-es/headerUtil.js
var hasHeader;
var init_headerUtil = __esmMin((() => {
	init_serde();
	hasHeader = (soughtHeader, headers) => {
		soughtHeader = soughtHeader.toLowerCase();
		for (const headerName in headers) {
			if (!hasOwn(headers, headerName)) continue;
			if (soughtHeader === headerName.toLowerCase()) return true;
		}
		return false;
	};
}));
//#endregion
//#region ../../node_modules/@smithy/signature-v4/dist-es/moveHeadersToQuery.js
var moveHeadersToQuery;
var init_moveHeadersToQuery = __esmMin((() => {
	init_serde();
	init_protocols$1();
	moveHeadersToQuery = (request, options = {}) => {
		const { headers, query = {} } = HttpRequest.clone(request);
		for (const name in headers) {
			if (!hasOwn(headers, name)) continue;
			const lname = name.toLowerCase();
			if (lname.slice(0, 6) === "x-amz-" && !options.unhoistableHeaders?.has(lname) || options.hoistableHeaders?.has(lname)) {
				query[name] = headers[name];
				delete headers[name];
			}
		}
		return {
			...request,
			headers,
			query
		};
	};
}));
//#endregion
//#region ../../node_modules/@smithy/signature-v4/dist-es/prepareRequest.js
var prepareRequest;
var init_prepareRequest = __esmMin((() => {
	init_serde();
	init_protocols$1();
	init_constants$2();
	prepareRequest = (request) => {
		request = HttpRequest.clone(request);
		for (const headerName in request.headers) {
			if (!hasOwn(request.headers, headerName)) continue;
			if (GENERATED_HEADERS.indexOf(headerName.toLowerCase()) > -1) delete request.headers[headerName];
		}
		return request;
	};
}));
//#endregion
//#region ../../node_modules/@smithy/signature-v4/dist-es/SignatureV4.js
var SignatureV4;
var init_SignatureV4 = __esmMin((() => {
	init_serde();
	init_HeaderFormatter();
	init_SignatureV4Base();
	init_constants$2();
	init_credentialDerivation();
	init_getCanonicalHeaders();
	init_getPayloadHash();
	init_headerUtil();
	init_moveHeadersToQuery();
	init_prepareRequest();
	SignatureV4 = class extends SignatureV4Base {
		headerFormatter = new HeaderFormatter();
		constructor({ applyChecksum, credentials, region, service, sha256, uriEscapePath = true }) {
			super({
				applyChecksum,
				credentials,
				region,
				service,
				sha256,
				uriEscapePath
			});
		}
		async presign(originalRequest, options = {}) {
			const { signingDate = /* @__PURE__ */ new Date(), expiresIn = 3600, unsignableHeaders, unhoistableHeaders, signableHeaders, hoistableHeaders, signingRegion, signingService } = options;
			const credentials = await this.credentialProvider();
			this.validateResolvedCredentials(credentials);
			const region = signingRegion ?? await this.regionProvider();
			const { longDate, shortDate } = this.formatDate(signingDate);
			if (expiresIn > 604800) return Promise.reject("Signature version 4 presigned URLs must have an expiration date less than one week in the future");
			const scope = createScope(shortDate, region, signingService ?? this.service);
			const request = moveHeadersToQuery(prepareRequest(originalRequest), {
				unhoistableHeaders,
				hoistableHeaders
			});
			if (credentials.sessionToken) request.query[TOKEN_QUERY_PARAM] = credentials.sessionToken;
			request.query[ALGORITHM_QUERY_PARAM] = ALGORITHM_IDENTIFIER;
			request.query[CREDENTIAL_QUERY_PARAM] = `${credentials.accessKeyId}/${scope}`;
			request.query[AMZ_DATE_QUERY_PARAM] = longDate;
			request.query[EXPIRES_QUERY_PARAM] = expiresIn.toString(10);
			const canonicalHeaders = getCanonicalHeaders(request, unsignableHeaders, signableHeaders);
			request.query[SIGNED_HEADERS_QUERY_PARAM] = this.getCanonicalHeaderList(canonicalHeaders);
			request.query[SIGNATURE_QUERY_PARAM] = await this.getSignature(longDate, scope, this.getSigningKey(credentials, region, shortDate, signingService), this.createCanonicalRequest(request, canonicalHeaders, await getPayloadHash(originalRequest, this.sha256)));
			return request;
		}
		async sign(toSign, options) {
			if (typeof toSign === "string") return this.signString(toSign, options);
			else if (toSign.headers && toSign.payload) return this.signEvent(toSign, options);
			else if (toSign.message) return this.signMessage(toSign, options);
			else return this.signRequest(toSign, options);
		}
		async signEvent({ headers, payload }, { signingDate = /* @__PURE__ */ new Date(), priorSignature, signingRegion, signingService, eventStreamCredentials }) {
			const region = signingRegion ?? await this.regionProvider();
			const { shortDate, longDate } = this.formatDate(signingDate);
			const scope = createScope(shortDate, region, signingService ?? this.service);
			const hashedPayload = await getPayloadHash({
				headers: {},
				body: payload
			}, this.sha256);
			const hash = new this.sha256();
			hash.update(headers);
			const hashedHeaders = toHex(await hash.digest());
			const stringToSign = [
				EVENT_ALGORITHM_IDENTIFIER,
				longDate,
				scope,
				priorSignature,
				hashedHeaders,
				hashedPayload
			].join("\n");
			return this.signString(stringToSign, {
				signingDate,
				signingRegion: region,
				signingService,
				eventStreamCredentials
			});
		}
		async signMessage(signableMessage, { signingDate = /* @__PURE__ */ new Date(), signingRegion, signingService, eventStreamCredentials }) {
			return this.signEvent({
				headers: this.headerFormatter.format(signableMessage.message.headers),
				payload: signableMessage.message.body
			}, {
				signingDate,
				signingRegion,
				signingService,
				priorSignature: signableMessage.priorSignature,
				eventStreamCredentials
			}).then((signature) => {
				return {
					message: signableMessage.message,
					signature
				};
			});
		}
		async signString(stringToSign, { signingDate = /* @__PURE__ */ new Date(), signingRegion, signingService, eventStreamCredentials } = {}) {
			const credentials = eventStreamCredentials ?? await this.credentialProvider();
			this.validateResolvedCredentials(credentials);
			const region = signingRegion ?? await this.regionProvider();
			const { shortDate } = this.formatDate(signingDate);
			const hash = new this.sha256(await this.getSigningKey(credentials, region, shortDate, signingService));
			hash.update(toUint8Array(stringToSign));
			return toHex(await hash.digest());
		}
		async signRequest(requestToSign, { signingDate = /* @__PURE__ */ new Date(), signableHeaders, unsignableHeaders, signingRegion, signingService } = {}) {
			const credentials = await this.credentialProvider();
			this.validateResolvedCredentials(credentials);
			const region = signingRegion ?? await this.regionProvider();
			const request = prepareRequest(requestToSign);
			const { longDate, shortDate } = this.formatDate(signingDate);
			const scope = createScope(shortDate, region, signingService ?? this.service);
			request.headers[AMZ_DATE_HEADER] = longDate;
			if (credentials.sessionToken) request.headers[TOKEN_HEADER] = credentials.sessionToken;
			const payloadHash = await getPayloadHash(request, this.sha256);
			if (!hasHeader("x-amz-content-sha256", request.headers) && this.applyChecksum) request.headers[SHA256_HEADER] = payloadHash;
			const canonicalHeaders = getCanonicalHeaders(request, unsignableHeaders, signableHeaders);
			const signature = await this.getSignature(longDate, scope, this.getSigningKey(credentials, region, shortDate, signingService), this.createCanonicalRequest(request, canonicalHeaders, payloadHash));
			request.headers[AUTH_HEADER] = `${ALGORITHM_IDENTIFIER} Credential=${credentials.accessKeyId}/${scope}, SignedHeaders=${this.getCanonicalHeaderList(canonicalHeaders)}, Signature=${signature}`;
			return request;
		}
		async getSignature(longDate, credentialScope, keyPromise, canonicalRequest) {
			const stringToSign = await this.createStringToSign(longDate, credentialScope, canonicalRequest, ALGORITHM_IDENTIFIER);
			const hash = new this.sha256(await keyPromise);
			hash.update(toUint8Array(stringToSign));
			return toHex(await hash.digest());
		}
		getSigningKey(credentials, region, shortDate, service) {
			return getSigningKey(this.sha256, credentials, shortDate, region, service || this.service);
		}
	};
}));
//#endregion
//#region ../../node_modules/@smithy/signature-v4/dist-es/signature-v4a-container.js
var signatureV4aContainer;
var init_signature_v4a_container = __esmMin((() => {
	signatureV4aContainer = { SignatureV4a: null };
}));
//#endregion
//#region ../../node_modules/@smithy/signature-v4/dist-es/index.js
var init_dist_es$12 = __esmMin((() => {
	init_SignatureV4();
	init_constants$2();
	init_getCanonicalHeaders();
	init_getCanonicalQuery();
	init_getPayloadHash();
	init_moveHeadersToQuery();
	init_prepareRequest();
	init_credentialDerivation();
	init_SignatureV4Base();
	init_headerUtil();
	init_signature_v4a_container();
}));
//#endregion
//#region ../../node_modules/@aws-sdk/signature-v4-multi-region/dist-es/signature-v4-crt-container.js
var signatureV4CrtContainer;
var init_signature_v4_crt_container = __esmMin((() => {
	signatureV4CrtContainer = { CrtSignerV4: null };
}));
//#endregion
//#region ../../node_modules/@aws-sdk/signature-v4-multi-region/dist-es/SignatureV4SignWithCredentials.js
function getCredentialsWithoutSessionToken(credentials) {
	return {
		accessKeyId: credentials.accessKeyId,
		secretAccessKey: credentials.secretAccessKey,
		expiration: credentials.expiration
	};
}
function setSingleOverride(privateAccess, credentialsWithoutSessionToken) {
	const currentCredentialProvider = privateAccess.credentialProvider;
	privateAccess.credentialProvider = () => {
		privateAccess.credentialProvider = currentCredentialProvider;
		return Promise.resolve(credentialsWithoutSessionToken);
	};
}
var SESSION_TOKEN_QUERY_PARAM$1, SESSION_TOKEN_HEADER$1, SignatureV4SignWithCredentials;
var init_SignatureV4SignWithCredentials = __esmMin((() => {
	init_dist_es$12();
	SESSION_TOKEN_QUERY_PARAM$1 = "X-Amz-S3session-Token";
	SESSION_TOKEN_HEADER$1 = SESSION_TOKEN_QUERY_PARAM$1.toLowerCase();
	SignatureV4SignWithCredentials = class extends SignatureV4 {
		async signWithCredentials(requestToSign, credentials, options) {
			const credentialsWithoutSessionToken = getCredentialsWithoutSessionToken(credentials);
			requestToSign.headers[SESSION_TOKEN_HEADER$1] = credentials.sessionToken;
			const privateAccess = this;
			setSingleOverride(privateAccess, credentialsWithoutSessionToken);
			return privateAccess.signRequest(requestToSign, options ?? {});
		}
		async presignWithCredentials(requestToSign, credentials, options) {
			const credentialsWithoutSessionToken = getCredentialsWithoutSessionToken(credentials);
			delete requestToSign.headers[SESSION_TOKEN_HEADER$1];
			requestToSign.headers[SESSION_TOKEN_QUERY_PARAM$1] = credentials.sessionToken;
			requestToSign.query = requestToSign.query ?? {};
			requestToSign.query[SESSION_TOKEN_QUERY_PARAM$1] = credentials.sessionToken;
			setSingleOverride(this, credentialsWithoutSessionToken);
			return this.presign(requestToSign, options);
		}
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/signature-v4-multi-region/dist-es/SignatureV4MultiRegion.js
var SignatureV4MultiRegion;
var init_SignatureV4MultiRegion = __esmMin((() => {
	init_dist_es$12();
	init_signature_v4_crt_container();
	init_SignatureV4SignWithCredentials();
	SignatureV4MultiRegion = class {
		sigv4aSigner;
		sigv4Signer;
		signerOptions;
		static sigv4aDependency() {
			if (typeof signatureV4CrtContainer.CrtSignerV4 === "function") return "crt";
			else if (typeof signatureV4aContainer.SignatureV4a === "function") return "js";
			return "none";
		}
		constructor(options) {
			this.sigv4Signer = new SignatureV4SignWithCredentials(options);
			this.signerOptions = options;
		}
		async sign(requestToSign, options = {}) {
			if (options.signingRegion === "*") return this.getSigv4aSigner().sign(requestToSign, options);
			return this.sigv4Signer.sign(requestToSign, options);
		}
		async signWithCredentials(requestToSign, credentials, options = {}) {
			if (options.signingRegion === "*") {
				const signer = this.getSigv4aSigner();
				const CrtSignerV4 = signatureV4CrtContainer.CrtSignerV4;
				if (CrtSignerV4 && signer instanceof CrtSignerV4) return signer.signWithCredentials(requestToSign, credentials, options);
				else throw new Error("signWithCredentials with signingRegion '*' is only supported when using the CRT dependency @aws-sdk/signature-v4-crt. Please check whether you have installed the \"@aws-sdk/signature-v4-crt\" package explicitly. You must also register the package by calling [require(\"@aws-sdk/signature-v4-crt\");] or an ESM equivalent such as [import \"@aws-sdk/signature-v4-crt\";]. For more information please go to https://github.com/aws/aws-sdk-js-v3#functionality-requiring-aws-common-runtime-crt");
			}
			return this.sigv4Signer.signWithCredentials(requestToSign, credentials, options);
		}
		async presign(originalRequest, options = {}) {
			if (options.signingRegion === "*") {
				const signer = this.getSigv4aSigner();
				const CrtSignerV4 = signatureV4CrtContainer.CrtSignerV4;
				if (CrtSignerV4 && signer instanceof CrtSignerV4) return signer.presign(originalRequest, options);
				else throw new Error("presign with signingRegion '*' is only supported when using the CRT dependency @aws-sdk/signature-v4-crt. Please check whether you have installed the \"@aws-sdk/signature-v4-crt\" package explicitly. You must also register the package by calling [require(\"@aws-sdk/signature-v4-crt\");] or an ESM equivalent such as [import \"@aws-sdk/signature-v4-crt\";]. For more information please go to https://github.com/aws/aws-sdk-js-v3#functionality-requiring-aws-common-runtime-crt");
			}
			return this.sigv4Signer.presign(originalRequest, options);
		}
		async presignWithCredentials(originalRequest, credentials, options = {}) {
			if (options.signingRegion === "*") throw new Error("Method presignWithCredentials is not supported for [signingRegion=*].");
			return this.sigv4Signer.presignWithCredentials(originalRequest, credentials, options);
		}
		getSigv4aSigner() {
			if (!this.sigv4aSigner) {
				const CrtSignerV4 = signatureV4CrtContainer.CrtSignerV4;
				const JsSigV4aSigner = signatureV4aContainer.SignatureV4a;
				if (this.signerOptions.runtime === "node") {
					if (!CrtSignerV4 && !JsSigV4aSigner) throw new Error("Neither CRT nor JS SigV4a implementation is available. Please load either @aws-sdk/signature-v4-crt or @aws-sdk/signature-v4a. For more information please go to https://github.com/aws/aws-sdk-js-v3#functionality-requiring-aws-common-runtime-crt");
					if (CrtSignerV4 && typeof CrtSignerV4 === "function") this.sigv4aSigner = new CrtSignerV4({
						...this.signerOptions,
						signingAlgorithm: 1
					});
					else if (JsSigV4aSigner && typeof JsSigV4aSigner === "function") this.sigv4aSigner = new JsSigV4aSigner({ ...this.signerOptions });
					else throw new Error("Available SigV4a implementation is not a valid constructor. Please ensure you've properly imported @aws-sdk/signature-v4-crt or @aws-sdk/signature-v4a.For more information please go to https://github.com/aws/aws-sdk-js-v3#functionality-requiring-aws-common-runtime-crt");
				} else {
					if (!JsSigV4aSigner || typeof JsSigV4aSigner !== "function") throw new Error("JS SigV4a implementation is not available or not a valid constructor. Please check whether you have installed the @aws-sdk/signature-v4a package explicitly. The CRT implementation is not available for browsers. You must also register the package by calling [require('@aws-sdk/signature-v4a');] or an ESM equivalent such as [import '@aws-sdk/signature-v4a';]. For more information please go to https://github.com/aws/aws-sdk-js-v3#using-javascript-non-crt-implementation-of-sigv4a");
					this.sigv4aSigner = new JsSigV4aSigner({ ...this.signerOptions });
				}
			}
			return this.sigv4aSigner;
		}
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/signature-v4-multi-region/dist-es/index.js
var init_dist_es$11 = __esmMin((() => {
	init_SignatureV4MultiRegion();
	init_signature_v4_crt_container();
	init_SignatureV4SignWithCredentials();
}));
//#endregion
//#region ../../node_modules/@aws-sdk/middleware-sdk-s3/dist-es/submodules/s3/middleware-s3-express/constants.js
init_config$1();
var S3_EXPRESS_AUTH_SCHEME = "sigv4-s3express";
var SESSION_TOKEN_HEADER = "X-Amz-S3session-Token".toLowerCase();
var NODE_DISABLE_S3_EXPRESS_SESSION_AUTH_ENV_NAME = "AWS_S3_DISABLE_EXPRESS_SESSION_AUTH";
var NODE_DISABLE_S3_EXPRESS_SESSION_AUTH_INI_NAME = "s3_disable_express_session_auth";
var NODE_DISABLE_S3_EXPRESS_SESSION_AUTH_OPTIONS = {
	environmentVariableSelector: (env) => booleanSelector(env, NODE_DISABLE_S3_EXPRESS_SESSION_AUTH_ENV_NAME, SelectorType.ENV),
	configFileSelector: (profile) => booleanSelector(profile, NODE_DISABLE_S3_EXPRESS_SESSION_AUTH_INI_NAME, SelectorType.CONFIG),
	default: false
};
//#endregion
//#region ../../node_modules/@aws-sdk/middleware-sdk-s3/dist-es/submodules/s3/middleware-s3-express/functions/s3ExpressMiddleware.js
init_client();
init_protocols$1();
var s3ExpressMiddleware = (options) => {
	return (next, context) => async (args) => {
		if (context.endpointV2) {
			const endpoint = context.endpointV2;
			const isS3ExpressAuth = endpoint.properties?.authSchemes?.[0]?.name === S3_EXPRESS_AUTH_SCHEME;
			if (endpoint.properties?.backend === "S3Express" || endpoint.properties?.bucketType === "Directory") {
				setFeature(context, "S3_EXPRESS_BUCKET", "J");
				context.isS3ExpressBucket = true;
			}
			if (isS3ExpressAuth) {
				const requestBucket = args.input.Bucket;
				if (requestBucket) {
					const s3ExpressIdentity = await options.s3ExpressIdentityProvider.getS3ExpressIdentity(await options.credentials(), { Bucket: requestBucket });
					context.s3ExpressIdentity = s3ExpressIdentity;
					if (HttpRequest.isInstance(args.request) && s3ExpressIdentity.sessionToken) args.request.headers[SESSION_TOKEN_HEADER] = s3ExpressIdentity.sessionToken;
				}
			}
		}
		return next(args);
	};
};
var s3ExpressMiddlewareOptions = {
	name: "s3ExpressMiddleware",
	step: "build",
	tags: ["S3", "S3_EXPRESS"],
	override: true
};
var getS3ExpressPlugin = (options) => ({ applyToStack: (clientStack) => {
	clientStack.add(s3ExpressMiddleware(options), s3ExpressMiddlewareOptions);
} });
//#endregion
//#region ../../node_modules/@aws-sdk/middleware-sdk-s3/dist-es/submodules/s3/middleware-s3-express/functions/signS3Express.js
var signS3Express = async (s3ExpressIdentity, signingOptions, request, sigV4MultiRegionSigner) => {
	const signedRequest = await sigV4MultiRegionSigner.signWithCredentials(request, s3ExpressIdentity, {});
	if (signedRequest.headers["X-Amz-Security-Token"] || signedRequest.headers["x-amz-security-token"]) throw new Error("X-Amz-Security-Token must not be set for s3-express requests.");
	return signedRequest;
};
//#endregion
//#region ../../node_modules/@aws-sdk/middleware-sdk-s3/dist-es/submodules/s3/middleware-s3-express/functions/s3ExpressHttpSigningMiddleware.js
init_dist_es$13();
init_client$1();
init_protocols$1();
var defaultErrorHandler = (signingProperties) => (error) => {
	throw error;
};
var defaultSuccessHandler = (httpResponse, signingProperties) => {};
var s3ExpressHttpSigningMiddleware = (config) => (next, context) => async (args) => {
	if (!HttpRequest.isInstance(args.request)) return next(args);
	const scheme = getSmithyContext(context).selectedHttpAuthScheme;
	if (!scheme) throw new Error(`No HttpAuthScheme was selected: unable to sign request`);
	const { httpAuthOption: { signingProperties = {} }, identity, signer } = scheme;
	let request;
	if (context.s3ExpressIdentity) request = await signS3Express(context.s3ExpressIdentity, signingProperties, args.request, await config.signer());
	else request = await signer.sign(args.request, identity, signingProperties);
	const output = await next({
		...args,
		request
	}).catch((signer.errorHandler || defaultErrorHandler)(signingProperties));
	(signer.successHandler || defaultSuccessHandler)(output.response, signingProperties);
	return output;
};
var getS3ExpressHttpSigningPlugin = (config) => ({ applyToStack: (clientStack) => {
	clientStack.addRelativeTo(s3ExpressHttpSigningMiddleware(config), httpSigningMiddlewareOptions);
} });
//#endregion
//#region ../../node_modules/@aws-sdk/middleware-sdk-s3/dist-es/submodules/s3/to-stream/toStream.js
function toStream(bytes) {
	return Readable.from(Buffer.from(bytes));
}
//#endregion
//#region ../../node_modules/@aws-sdk/middleware-sdk-s3/dist-es/submodules/s3/middleware-throw-200-exceptions/throw-200-exceptions.js
init_protocols$1();
var THROW_IF_EMPTY_BODY = {
	CopyObjectCommand: true,
	UploadPartCopyCommand: true,
	CompleteMultipartUploadCommand: true
};
var throw200ExceptionsMiddleware = (config) => (next, context) => async (args) => {
	const result = await next(args);
	const { response } = result;
	if (!HttpResponse.isInstance(response)) return result;
	const { statusCode, body } = response;
	if (statusCode < 200 || statusCode >= 300) return result;
	const bodyBytes = await collectBody(body, config);
	response.body = toStream(bodyBytes);
	if (bodyBytes.length === 0 && THROW_IF_EMPTY_BODY[context.commandName]) {
		const err = /* @__PURE__ */ new Error("S3 aborted request");
		err.$metadata = { httpStatusCode: 503 };
		err.name = "InternalError";
		throw err;
	}
	const bodyStringTail = config.utf8Encoder(bodyBytes.subarray(bodyBytes.length - 16));
	if (bodyStringTail && bodyStringTail.endsWith("</Error>")) response.statusCode = 503;
	return result;
};
var collectBody = (streamBody = /* @__PURE__ */ new Uint8Array(), context) => {
	if (streamBody instanceof Uint8Array) return Promise.resolve(streamBody);
	return context.streamCollector(streamBody) || Promise.resolve(/* @__PURE__ */ new Uint8Array());
};
var throw200ExceptionsMiddlewareOptions = {
	relation: "after",
	toMiddleware: "deserializerMiddleware",
	tags: ["THROW_200_EXCEPTIONS", "S3"],
	name: "throw200ExceptionsMiddleware",
	override: true
};
var getThrow200ExceptionsPlugin = (config) => ({ applyToStack: (clientStack) => {
	clientStack.addRelativeTo(throw200ExceptionsMiddleware(config), throw200ExceptionsMiddlewareOptions);
} });
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/util/util-arn-parser/arn.js
var validate = (str) => typeof str === "string" && str.indexOf("arn:") === 0 && str.split(":").length >= 6;
//#endregion
//#region ../../node_modules/@aws-sdk/middleware-sdk-s3/dist-es/submodules/s3/middleware-region-redirect/bucket-endpoint-middleware.js
function bucketEndpointMiddleware(options) {
	return (next, context) => async (args) => {
		if (options.bucketEndpoint) {
			const endpoint = context.endpointV2;
			if (endpoint) {
				const bucket = args.input.Bucket;
				if (typeof bucket === "string") try {
					const bucketEndpointUrl = new URL(bucket);
					context.endpointV2 = {
						...endpoint,
						url: bucketEndpointUrl
					};
				} catch (e) {
					const warning = `@aws-sdk/middleware-sdk-s3: bucketEndpoint=true was set but Bucket=${bucket} could not be parsed as URL.`;
					if (context.logger?.constructor?.name === "NoOpLogger") console.warn(warning);
					else context.logger?.warn?.(warning);
					throw e;
				}
			}
		}
		return next(args);
	};
}
var bucketEndpointMiddlewareOptions = {
	name: "bucketEndpointMiddleware",
	override: true,
	relation: "after",
	toMiddleware: "endpointV2Middleware"
};
//#endregion
//#region ../../node_modules/@aws-sdk/middleware-sdk-s3/dist-es/submodules/s3/middleware-validate-bucket-name/validate-bucket-name.js
function validateBucketNameMiddleware({ bucketEndpoint }) {
	return (next) => async (args) => {
		const { input: { Bucket } } = args;
		if (!bucketEndpoint && typeof Bucket === "string" && !validate(Bucket) && Bucket.indexOf("/") >= 0) {
			const err = /* @__PURE__ */ new Error(`Bucket name shouldn't contain '/', received '${Bucket}'`);
			err.name = "InvalidBucketName";
			throw err;
		}
		return next({ ...args });
	};
}
var validateBucketNameMiddlewareOptions = {
	step: "initialize",
	tags: ["VALIDATE_BUCKET_NAME"],
	name: "validateBucketNameMiddleware",
	override: true
};
var getValidateBucketNamePlugin = (options) => ({ applyToStack: (clientStack) => {
	clientStack.add(validateBucketNameMiddleware(options), validateBucketNameMiddlewareOptions);
	clientStack.addRelativeTo(bucketEndpointMiddleware(options), bucketEndpointMiddlewareOptions);
} });
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/protocols/ProtocolLib.js
var ProtocolLib;
var init_ProtocolLib = __esmMin((() => {
	init_client$1();
	init_schema();
	ProtocolLib = class {
		queryCompat;
		errorRegistry;
		constructor(queryCompat = false) {
			this.queryCompat = queryCompat;
		}
		resolveRestContentType(defaultContentType, inputSchema) {
			const members = inputSchema.getMemberSchemas();
			const httpPayloadMember = Object.values(members).find((m) => {
				return !!m.getMergedTraits().httpPayload;
			});
			if (httpPayloadMember) {
				const mediaType = httpPayloadMember.getMergedTraits().mediaType;
				if (mediaType) return mediaType;
				else if (httpPayloadMember.isStringSchema()) return "text/plain";
				else if (httpPayloadMember.isBlobSchema()) return "application/octet-stream";
				else return defaultContentType;
			} else if (!inputSchema.isUnitSchema()) {
				if (Object.values(members).find((m) => {
					const { httpQuery, httpQueryParams, httpHeader, httpLabel, httpPrefixHeaders } = m.getMergedTraits();
					return !httpQuery && !httpQueryParams && !httpHeader && !httpLabel && httpPrefixHeaders === void 0;
				})) return defaultContentType;
			}
		}
		async getErrorSchemaOrThrowBaseException(errorIdentifier, defaultNamespace, response, dataObject, metadata, getErrorSchema) {
			let errorName = errorIdentifier;
			if (errorIdentifier.includes("#")) [, errorName] = errorIdentifier.split("#");
			const errorMetadata = {
				$metadata: metadata,
				$fault: response.statusCode < 500 ? "client" : "server"
			};
			if (!this.errorRegistry) throw new Error("@aws-sdk/core/protocols - error handler not initialized.");
			try {
				return {
					errorSchema: getErrorSchema?.(this.errorRegistry, errorName) ?? this.errorRegistry.getSchema(errorIdentifier),
					errorMetadata
				};
			} catch (e) {
				dataObject.message = dataObject.message ?? dataObject.Message ?? "UnknownError";
				const synthetic = this.errorRegistry;
				const baseExceptionSchema = synthetic.getBaseException();
				if (baseExceptionSchema) {
					const ErrorCtor = synthetic.getErrorCtor(baseExceptionSchema) ?? Error;
					throw this.decorateServiceException(Object.assign(new ErrorCtor({ name: errorName }), errorMetadata), dataObject);
				}
				const d = dataObject;
				const message = d?.message ?? d?.Message ?? d?.Error?.Message ?? d?.Error?.message;
				throw this.decorateServiceException(Object.assign(new Error(message), { name: errorName }, errorMetadata), dataObject);
			}
		}
		compose(composite, errorIdentifier, defaultNamespace) {
			let namespace = defaultNamespace;
			if (errorIdentifier.includes("#")) [namespace] = errorIdentifier.split("#");
			const staticRegistry = TypeRegistry.for(namespace);
			const defaultSyntheticRegistry = TypeRegistry.for("smithy.ts.sdk.synthetic." + defaultNamespace);
			composite.copyFrom(staticRegistry);
			composite.copyFrom(defaultSyntheticRegistry);
			this.errorRegistry = composite;
		}
		decorateServiceException(exception, additions = {}) {
			if (this.queryCompat) {
				const msg = exception.Message ?? additions.Message;
				const error = decorateServiceException(exception, additions);
				if (msg) error.message = msg;
				const errorObj = error.Error ?? {};
				errorObj.Type = error.Error?.Type;
				errorObj.Code = error.Error?.Code;
				errorObj.Message = error.Error?.message ?? error.Error?.Message ?? msg;
				error.Error = errorObj;
				const reqId = error.$metadata.requestId;
				if (reqId) error.RequestId = reqId;
				return error;
			}
			return decorateServiceException(exception, additions);
		}
		setQueryCompatError(output, response) {
			const queryErrorHeader = response.headers?.["x-amzn-query-error"];
			if (output !== void 0 && queryErrorHeader != null) {
				const [Code, Type] = queryErrorHeader.split(";");
				const keys = Object.keys(output);
				const Error = {
					Code,
					Type
				};
				output.Code = Code;
				output.Type = Type;
				for (let i = 0; i < keys.length; i++) {
					const k = keys[i];
					Error[k === "message" ? "Message" : k] = output[k];
				}
				delete Error.__type;
				output.Error = Error;
			}
		}
		queryCompatOutput(queryCompatErrorData, errorData) {
			if (queryCompatErrorData.Error) errorData.Error = queryCompatErrorData.Error;
			if (queryCompatErrorData.Type) errorData.Type = queryCompatErrorData.Type;
			if (queryCompatErrorData.Code) errorData.Code = queryCompatErrorData.Code;
		}
		findQueryCompatibleError(registry, errorName) {
			try {
				return registry.getSchema(errorName);
			} catch (e) {
				return registry.find((schema) => NormalizedSchema.of(schema).getMergedTraits().awsQueryError?.[0] === errorName);
			}
		}
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/protocols/ConfigurableSerdeContext.js
var SerdeContextConfig;
var init_ConfigurableSerdeContext = __esmMin((() => {
	SerdeContextConfig = class {
		serdeContext;
		setSerdeContext(serdeContext) {
			this.serdeContext = serdeContext;
		}
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/protocols/UnionSerde.js
var UnionSerde;
var init_UnionSerde = __esmMin((() => {
	UnionSerde = class {
		from;
		to;
		keys;
		constructor(from, to) {
			this.from = from;
			this.to = to;
			const keys = Object.keys(this.from);
			const set = new Set(keys);
			set.delete("__type");
			this.keys = set;
		}
		mark(key) {
			this.keys.delete(key);
		}
		hasUnknown() {
			return this.keys.size === 1 && Object.keys(this.to).length === 0;
		}
		writeUnknown() {
			if (this.hasUnknown()) {
				const k = this.keys.values().next().value;
				const v = this.from[k];
				this.to.$unknown = [k, v];
			}
		}
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/protocols/json/detectBufferParsing.js
function detectBufferParsing() {
	if (canParseBuffer === void 0) try {
		if (typeof Buffer !== "function") canParseBuffer = false;
		else {
			const result = JSON.parse(Buffer.from([123, 125]));
			canParseBuffer = result !== null && typeof result === "object";
		}
	} catch {
		canParseBuffer = false;
	}
	return canParseBuffer;
}
var canParseBuffer;
var init_detectBufferParsing = __esmMin((() => {}));
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/protocols/json/jsonReviver.js
function jsonReviver(key, value, context) {
	if (context?.source) {
		const numericString = context.source;
		if (typeof value === "number") {
			if (value <= Number.MAX_SAFE_INTEGER && value >= Number.MIN_SAFE_INTEGER) {
				if (isRepresentable(numericString, value)) return value;
				return new NumericValue(numericString, "bigDecimal");
			} else {
				if (isFractionalBigNumeric(numericString)) return new NumericValue(numericString, "bigDecimal");
				if (/[eE]/.test(numericString)) return expandExponentToBigInt(numericString);
				return BigInt(numericString);
			}
		}
	}
	return value;
}
function isFractionalBigNumeric(s) {
	const dotIndex = s.indexOf(".");
	if (dotIndex === -1) return false;
	const eIndex = s.search(/[eE]/);
	if (eIndex === -1) return true;
	const fracDigits = eIndex - dotIndex - 1;
	return parseInt(s.slice(eIndex + 1), 10) < fracDigits;
}
function isRepresentable(numericString, value) {
	if (numericString === String(value)) return true;
	if (Object.is(value, -0)) return true;
	if (/[eE]/.test(numericString)) return expandToDecimal(numericString) === expandToDecimal(String(value));
	const normalized = numericString.replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
	const canonical = String(value);
	if (normalized === canonical) return true;
	if (/[eE]/.test(canonical)) return normalized === expandToDecimal(canonical);
	return false;
}
function expandToDecimal(s) {
	const negative = s.startsWith("-");
	const abs = negative ? s.slice(1) : s;
	const eIndex = abs.search(/[eE]/);
	let result;
	if (eIndex === -1) result = abs;
	else {
		const exp = parseInt(abs.slice(eIndex + 1), 10);
		const mantissa = abs.slice(0, eIndex);
		const dotIndex = mantissa.indexOf(".");
		let digits;
		let intLen;
		if (dotIndex === -1) {
			digits = mantissa;
			intLen = mantissa.length;
		} else {
			digits = mantissa.slice(0, dotIndex) + mantissa.slice(dotIndex + 1);
			intLen = dotIndex;
		}
		digits = digits.replace(/0+$/, "") || "0";
		const newDotPos = intLen + exp;
		if (digits === "0") result = "0";
		else if (newDotPos <= 0) result = "0." + "0".repeat(-newDotPos) + digits;
		else if (newDotPos >= digits.length) result = digits + "0".repeat(newDotPos - digits.length);
		else result = digits.slice(0, newDotPos) + "." + digits.slice(newDotPos);
	}
	if (result.includes(".")) result = result.replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
	return (negative ? "-" : "") + result;
}
function expandExponentToBigInt(s) {
	const eIndex = s.search(/[eE]/);
	const exp = parseInt(s.slice(eIndex + 1), 10);
	const negative = s.startsWith("-");
	const mantissa = s.slice(negative ? 1 : 0, eIndex);
	const dotIndex = mantissa.indexOf(".");
	let digits;
	let shift;
	if (dotIndex === -1) {
		digits = mantissa;
		shift = exp;
	} else {
		digits = mantissa.slice(0, dotIndex) + mantissa.slice(dotIndex + 1);
		shift = exp - (mantissa.length - dotIndex - 1);
	}
	digits = digits.replace(/0+$/, "") || "0";
	const result = BigInt(digits) * 10n ** BigInt(shift + (mantissa.replace(".", "").length - digits.length));
	return negative ? -result : result;
}
var init_jsonReviver = __esmMin((() => {
	init_serde();
}));
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/protocols/json/needsReviver.js
function needsReviver(schema) {
	const ns = NormalizedSchema.of(schema);
	const raw = ns.getSchema();
	if (Array.isArray(raw) && ns.isStructSchema()) {
		if (REVIVER_SYMBOL in raw) return raw[REVIVER_SYMBOL];
		const result = _check(ns, /* @__PURE__ */ new Set());
		raw[REVIVER_SYMBOL] = result;
		return result;
	}
	return _check(ns, /* @__PURE__ */ new Set());
}
function _check(ns, seen) {
	const raw = ns.getSchema();
	if (seen.has(raw)) return false;
	seen.add(raw);
	if (ns.isBigIntegerSchema() || ns.isBigDecimalSchema()) return true;
	if (ns.isStructSchema()) {
		for (const [, memberSchema] of ns.structIterator()) if (_check(memberSchema, seen)) return true;
	} else if (ns.isListSchema() || ns.isMapSchema()) {
		if (_check(ns.getValueSchema(), seen)) return true;
	} else if (ns.isDocumentSchema()) return true;
	return false;
}
var REVIVER_SYMBOL;
var init_needsReviver = __esmMin((() => {
	init_schema();
	REVIVER_SYMBOL = Symbol.for("@aws-sdk/reviver");
}));
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/protocols/common.js
var collectBodyString;
var init_common = __esmMin((() => {
	init_protocols$1();
	init_serde();
	collectBodyString = (streamBody, context) => collectBody$1(streamBody, context).then((body) => (context?.utf8Encoder ?? toUtf8$1)(body));
}));
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/protocols/json/parseJsonBody.js
async function parseJsonBody(streamBody, context, schema) {
	let parsingInput;
	if (detectBufferParsing() && typeof streamBody?.[Symbol.asyncIterator] === "function") {
		const buffer = await collectBody$1(streamBody, context);
		if (typeof Buffer === "function") {
			if (Buffer.isBuffer(buffer)) parsingInput = buffer;
			else parsingInput = Buffer.from(buffer.buffer, buffer.byteOffset, buffer.byteLength);
		}
	}
	if (!parsingInput) parsingInput = await collectBodyString(streamBody, context);
	if (parsingInput.length === 0) return {};
	const reviver = schema && needsReviver(schema) ? jsonReviver : void 0;
	try {
		return JSON.parse(parsingInput, reviver);
	} catch (e) {
		if (e?.name === "SyntaxError") Object.defineProperty(e, "$responseBodyText", { value: typeof parsingInput === "string" ? parsingInput : parsingInput.toString("utf8") });
		throw e;
	}
}
var findKey, sanitizeErrorCode, loadRestJsonErrorCode, loadErrorCode;
var init_parseJsonBody = __esmMin((() => {
	init_protocols$1();
	init_common();
	init_detectBufferParsing();
	init_jsonReviver();
	init_needsReviver();
	findKey = (object, key) => Object.keys(object).find((k) => k.toLowerCase() === key.toLowerCase());
	sanitizeErrorCode = (rawValue) => {
		let cleanValue = rawValue;
		if (typeof cleanValue === "number") cleanValue = cleanValue.toString();
		if (cleanValue.indexOf(",") >= 0) cleanValue = cleanValue.split(",")[0];
		if (cleanValue.indexOf(":") >= 0) cleanValue = cleanValue.split(":")[0];
		if (cleanValue.indexOf("#") >= 0) cleanValue = cleanValue.split("#")[1];
		return cleanValue;
	};
	loadRestJsonErrorCode = (output, data) => {
		return loadErrorCode(output, data, [
			"header",
			"code",
			"type"
		]);
	};
	loadErrorCode = ({ headers }, data, order) => {
		while (order.length > 0) switch (order.shift()) {
			case "header":
				const headerKey = findKey(headers ?? {}, "x-amzn-errortype");
				if (headerKey !== void 0) return sanitizeErrorCode(headers[headerKey]);
				break;
			case "code":
				const codeKey = findKey(data ?? {}, "code");
				if (codeKey && data[codeKey] !== void 0) return sanitizeErrorCode(data[codeKey]);
				break;
			case "type": if (data?.__type !== void 0) return sanitizeErrorCode(data.__type);
		}
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/protocols/writeKey.js
function writeKey$1(obj) {
	Object.defineProperty(obj, "__proto__", {
		value: void 0,
		writable: true,
		enumerable: true,
		configurable: true
	});
}
var init_writeKey = __esmMin((() => {}));
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/protocols/json/codec-v2/JsonShapeDeserializer2.js
var JsonShapeDeserializer2;
var init_JsonShapeDeserializer2 = __esmMin((() => {
	init_protocols$1();
	init_schema();
	init_serde();
	init_ConfigurableSerdeContext();
	init_UnionSerde();
	init_detectBufferParsing();
	init_jsonReviver();
	init_needsReviver();
	init_parseJsonBody();
	init_writeKey();
	JsonShapeDeserializer2 = class extends SerdeContextConfig {
		settings;
		constructor(settings) {
			super();
			this.settings = settings;
		}
		async read(schema, data) {
			const reviver = needsReviver(schema) ? jsonReviver : void 0;
			let parsed;
			if (typeof data === "string") {
				if (data.length === 0) return {};
				parsed = JSON.parse(data, reviver);
			} else if (data instanceof Uint8Array && detectBufferParsing()) {
				if (data.byteLength === 0) return {};
				const buf = Buffer.isBuffer(data) ? data : Buffer.from(data.buffer, data.byteOffset, data.byteLength);
				parsed = JSON.parse(buf, reviver);
			} else parsed = await parseJsonBody(data, this.serdeContext, schema);
			return this._read(schema, parsed);
		}
		readObject(schema, data) {
			return this._read(schema, data);
		}
		_read(schema, value) {
			const isObject = value !== null && typeof value === "object";
			const ns = NormalizedSchema.of(schema);
			if (isObject) {
				if (ns.isStructSchema()) return this._readStruct(ns, value);
				if (Array.isArray(value) && ns.isListSchema()) {
					const listMember = ns.getValueSchema();
					if (this.needsTransform(listMember)) for (let i = 0; i < value.length; ++i) value[i] = this._read(listMember, value[i]);
					return value;
				}
				if (ns.isMapSchema()) {
					const mapMember = ns.getValueSchema();
					const map = value;
					if (this.needsTransform(mapMember)) for (const k in map) {
						if (k === "__proto__") writeKey$1(map);
						map[k] = this._read(mapMember, map[k]);
					}
					return map;
				}
			}
			if (ns.isBlobSchema() && typeof value === "string") return fromBase64(value);
			const mediaType = ns.getMergedTraits().mediaType;
			if (ns.isStringSchema() && typeof value === "string" && mediaType) {
				if (mediaType === "application/json" || mediaType.endsWith("+json")) return LazyJsonString.from(value);
				return value;
			}
			if (ns.isTimestampSchema() && value != null) switch (determineTimestampFormat(ns, this.settings)) {
				case 5: return parseRfc3339DateTimeWithOffset(value);
				case 6: return parseRfc7231DateTime(value);
				case 7: return parseEpochTimestamp(value);
				default:
					console.warn("Missing timestamp format, parsing value with Date constructor:", value);
					return new Date(value);
			}
			if (ns.isBigIntegerSchema() && (typeof value === "number" || typeof value === "string")) return BigInt(value);
			if (ns.isBigDecimalSchema() && value != void 0) {
				if (value instanceof NumericValue) return value;
				const untyped = value;
				if (untyped.type === "bigDecimal" && "string" in untyped) return new NumericValue(untyped.string, untyped.type);
				return new NumericValue(String(value), "bigDecimal");
			}
			if (ns.isNumericSchema() && typeof value === "string") {
				switch (value) {
					case "Infinity": return Infinity;
					case "-Infinity": return -Infinity;
					case "NaN": return NaN;
				}
				return value;
			}
			if (ns.isDocumentSchema()) {
				if (isObject) {
					if (Array.isArray(value)) for (let i = 0; i < value.length; ++i) {
						const v = value[i];
						if (!(v instanceof NumericValue)) value[i] = this._read(ns, v);
					}
					else {
						const doc = value;
						for (const k in doc) {
							if (k === "__proto__") writeKey$1(doc);
							const v = doc[k];
							if (!(v instanceof NumericValue)) doc[k] = this._read(ns, v);
						}
					}
				}
			}
			return value;
		}
		_readStruct(ns, record) {
			const union = ns.isUnionSchema();
			const out = {};
			let nameMap;
			const hasType = typeof record.__type === "string";
			const { jsonName } = this.settings;
			if (jsonName && hasType) nameMap = {};
			let unionSerde;
			if (union) unionSerde = new UnionSerde(record, out);
			for (const [memberName, memberSchema] of ns.structIterator()) {
				let fromKey = memberName;
				if (jsonName) {
					fromKey = memberSchema.getMergedTraits().jsonName ?? fromKey;
					if (hasType) nameMap[fromKey] = memberName;
				}
				if (union) unionSerde.mark(fromKey);
				if (record[fromKey] != null) out[memberName] = this._read(memberSchema, record[fromKey]);
			}
			if (union) unionSerde.writeUnknown();
			else if (hasType) for (const k in record) {
				const v = record[k];
				const t = jsonName ? nameMap[k] ?? k : k;
				if (!(t in out)) out[t] = v;
			}
			return out;
		}
		needsTransform(ns) {
			if (ns.isBlobSchema() || ns.isTimestampSchema() || ns.isBigIntegerSchema() || ns.isBigDecimalSchema()) return true;
			if (ns.isDocumentSchema() || ns.isStructSchema() || ns.isListSchema() || ns.isMapSchema()) return true;
			if (ns.isStringSchema() && ns.getMergedTraits().mediaType) return true;
			return false;
		}
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/protocols/json/codec-v2/JsonBytesStringAdapter.js
var JsonBytesStringAdapter, warned;
var init_JsonBytesStringAdapter = __esmMin((() => {
	init_serde();
	JsonBytesStringAdapter = class JsonBytesStringAdapter extends Uint8Array {
		string = null;
		static allocUnsafe(bytes) {
			if (typeof Buffer === "function") {
				const buffer = Buffer.allocUnsafe(bytes);
				return new JsonBytesStringAdapter(buffer.buffer, buffer.byteOffset, buffer.byteLength);
			}
			return new JsonBytesStringAdapter(bytes);
		}
		toString() {
			return this.s();
		}
		valueOf() {
			return this.s();
		}
		includes(searchString, position) {
			if (typeof searchString === "string") return this.s().includes(searchString, position);
			return Uint8Array.prototype.includes.call(this, searchString, position);
		}
		indexOf(searchString, position) {
			if (typeof searchString === "string") return this.s().indexOf(searchString, position);
			return Uint8Array.prototype.indexOf.call(this, searchString, position);
		}
		lastIndexOf(searchString, position) {
			if (typeof searchString === "string") return this.s().lastIndexOf(searchString, position);
			const fn = Uint8Array.prototype.lastIndexOf;
			if (position !== void 0) return fn.call(this, searchString, position);
			return fn.call(this, searchString);
		}
		startsWith(searchString, position) {
			return this.s().startsWith(searchString, position);
		}
		endsWith(searchString, endPosition) {
			return this.s().endsWith(searchString, endPosition);
		}
		match(regexp) {
			return this.s().match(regexp);
		}
		replace(searchValue, replaceValue) {
			return this.s().replace(searchValue, replaceValue);
		}
		search(regexp) {
			return this.s().search(regexp);
		}
		split(separator, limit) {
			return this.s().split(separator, limit);
		}
		substring(start, end) {
			return this.s().substring(start, end);
		}
		trim() {
			return this.s().trim();
		}
		trimStart() {
			return this.s().trimStart();
		}
		trimEnd() {
			return this.s().trimEnd();
		}
		charAt(pos) {
			return this.s().charAt(pos);
		}
		charCodeAt(index) {
			return this.s().charCodeAt(index);
		}
		padStart(maxLength, fillString) {
			return this.s().padStart(maxLength, fillString);
		}
		padEnd(maxLength, fillString) {
			return this.s().padEnd(maxLength, fillString);
		}
		repeat(count) {
			return this.s().repeat(count);
		}
		toUpperCase() {
			return this.s().toUpperCase();
		}
		toLowerCase() {
			return this.s().toLowerCase();
		}
		s() {
			if (this.string == null) {
				const n = Date.now();
				if (n > warned + 6e4) {
					console.warn("@aws-sdk/core/protocols - WARN - JsonCodec2: you have called a string method on a Uint8Array request body. It has been automatically converted to string. In a future version this will throw an error.");
					warned = n;
				}
				this.string = toUtf8$1(this);
			}
			return this.string;
		}
	};
	warned = 0;
}));
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/protocols/json/codec-v2/JsonShapeSerializer2.js
function alloc(size) {
	return JsonBytesStringAdapter.allocUnsafe(size);
}
var encoder, OPEN_BRACE, CLOSE_BRACE, OPEN_BRACKET, CLOSE_BRACKET, QUOTE, COLON, COMMA, BACKSLASH, TRUE, FALSE, NULL, ESCAPE_TABLE, INITIAL_BUFFER_SIZE, JsonShapeSerializer2;
var init_JsonShapeSerializer2 = __esmMin((() => {
	init_protocols$1();
	init_schema();
	init_serde();
	init_ConfigurableSerdeContext();
	init_JsonBytesStringAdapter();
	encoder = new TextEncoder();
	OPEN_BRACE = 123;
	CLOSE_BRACE = 125;
	OPEN_BRACKET = 91;
	CLOSE_BRACKET = 93;
	QUOTE = 34;
	COLON = 58;
	COMMA = 44;
	BACKSLASH = 92;
	TRUE = new Uint8Array([
		116,
		114,
		117,
		101
	]);
	FALSE = new Uint8Array([
		102,
		97,
		108,
		115,
		101
	]);
	NULL = new Uint8Array([
		110,
		117,
		108,
		108
	]);
	ESCAPE_TABLE = new Array(128).fill(null);
	ESCAPE_TABLE[8] = "b";
	ESCAPE_TABLE[9] = "t";
	ESCAPE_TABLE[10] = "n";
	ESCAPE_TABLE[12] = "f";
	ESCAPE_TABLE[13] = "r";
	ESCAPE_TABLE[34] = "\"";
	ESCAPE_TABLE[92] = "\\";
	for (let i = 0; i < 32; i++) if (ESCAPE_TABLE[i] === null) ESCAPE_TABLE[i] = "u00" + i.toString(16).padStart(2, "0");
	INITIAL_BUFFER_SIZE = 2048;
	JsonShapeSerializer2 = class JsonShapeSerializer2 extends SerdeContextConfig {
		settings;
		json;
		i = 0;
		rootSchema;
		rawValue;
		passthrough = false;
		constructor(settings) {
			super();
			this.settings = settings;
			this.json = alloc(INITIAL_BUFFER_SIZE);
		}
		write(schema, value) {
			this.i = 0;
			this.rawValue = value;
			this.rootSchema = NormalizedSchema.of(schema);
			this.passthrough = this.rootSchema.isBlobSchema() || this.rootSchema.isStringSchema();
			if (!this.passthrough) this.writeValue(this.rootSchema, value, void 0);
		}
		writeDiscriminatedDocument(schema, value) {
			this.i = 0;
			this.rootSchema = NormalizedSchema.of(schema);
			const ns = this.rootSchema;
			if (ns.isStructSchema() && value != null && typeof value === "object") {
				this.writeValue(ns, value, void 0);
				const prefix = `"__type":"${ns.getName(true) ?? "Unknown"}",`;
				const z = prefix.length;
				this.ensure(z);
				this.json.copyWithin(1 + z, 1, this.i);
				encoder.encodeInto(prefix, this.json.subarray(1));
				this.i += z;
			} else this.writeValue(ns, value, void 0);
		}
		flush() {
			this.rootSchema = void 0;
			const finalPosition = this.i;
			this.i = 0;
			const raw = this.rawValue;
			this.rawValue = void 0;
			if (finalPosition === 0) return raw;
			const result = this.json.subarray(0, finalPosition);
			this.json = alloc(INITIAL_BUFFER_SIZE);
			return result;
		}
		ensure(byteCount) {
			const { i, json } = this;
			if (i + byteCount > json.length) {
				let newSize = json.length * 2;
				while (newSize < i + byteCount) newSize *= 2;
				const next = alloc(newSize);
				next.set(this.json);
				this.json = next;
			}
		}
		writeAscii(s) {
			const z = s.length;
			this.ensure(z);
			let { i, json } = this;
			for (let j = 0; j < z; ++j) {
				json[i] = s.charCodeAt(j);
				i += 1;
			}
			this.i = i;
		}
		writeAsciiQuoted(s) {
			const z = s.length;
			this.ensure(z + 4);
			let { json, i } = this;
			json[i++] = QUOTE;
			for (let j = 0; j < z; ++j) json[i++] = s.charCodeAt(j);
			json[i++] = QUOTE;
			this.i = i;
		}
		writeJsonString(s) {
			this.ensure(s.length * 3 + 2);
			this.json[this.i++] = QUOTE;
			const z = s.length;
			for (let j = 0; j < z; ++j) {
				const c = s.charCodeAt(j);
				if (c > 34 && c < 92) this.json[this.i++] = c;
				else if (c < 128) {
					const esc = ESCAPE_TABLE[c];
					if (esc !== null) {
						this.ensure(esc.length + 1);
						this.json[this.i++] = BACKSLASH;
						for (let k = 0; k < esc.length; k++) this.json[this.i++] = esc.charCodeAt(k);
					} else this.json[this.i++] = c;
				} else if (c >= 55296 && c <= 56319) {
					const next = j + 1 < z ? s.charCodeAt(j + 1) : 0;
					if (next >= 56320 && next <= 57343) {
						this.ensure(4);
						const { written } = encoder.encodeInto(s.substring(j, j + 2), this.json.subarray(this.i));
						this.i += written;
						++j;
					} else {
						this.ensure(6);
						this.writeUnicodeEscape(c);
					}
				} else if (c >= 56320 && c <= 57343) {
					this.ensure(6);
					this.writeUnicodeEscape(c);
				} else {
					let { i, json } = this;
					if (c < 2048) {
						json[i++] = 192 | c >> 6;
						json[i++] = 128 | c & 63;
					} else {
						json[i++] = 224 | c >> 12;
						json[i++] = 128 | c >> 6 & 63;
						json[i++] = 128 | c & 63;
					}
					this.i = i;
				}
			}
			this.json[this.i++] = QUOTE;
		}
		writeUnicodeEscape(code) {
			let { json, i } = this;
			json[i++] = BACKSLASH;
			json[i++] = 117;
			const hex = code.toString(16).padStart(4, "0");
			for (let j = 0; j < 4; ++j) json[i++] = hex.charCodeAt(j);
			this.i = i;
		}
		static B64 = (() => {
			const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
			const table = /* @__PURE__ */ new Uint8Array(64);
			for (let i = 0; i < 64; ++i) table[i] = chars.charCodeAt(i);
			return table;
		})();
		writeBase64(data) {
			const b64Len = Math.ceil(data.length / 3) * 4;
			this.ensure(b64Len + 2);
			const json = this.json;
			const B64 = JsonShapeSerializer2.B64;
			let i = this.i;
			json[i++] = QUOTE;
			const len = data.length;
			const remainder = len % 3;
			const mainLen = len - remainder;
			for (let j = 0; j < mainLen; j += 3) {
				const a = data[j];
				const b = data[j + 1];
				const c = data[j + 2];
				json[i++] = B64[a >> 2];
				json[i++] = B64[(a & 3) << 4 | b >> 4];
				json[i++] = B64[(b & 15) << 2 | c >> 6];
				json[i++] = B64[c & 63];
			}
			if (remainder === 2) {
				const a = data[mainLen];
				const b = data[mainLen + 1];
				json[i++] = B64[a >> 2];
				json[i++] = B64[(a & 3) << 4 | b >> 4];
				json[i++] = B64[(b & 15) << 2];
				json[i++] = 61;
			} else if (remainder === 1) {
				const a = data[mainLen];
				json[i++] = B64[a >> 2];
				json[i++] = B64[(a & 3) << 4];
				json[i++] = 61;
				json[i++] = 61;
			}
			json[i++] = QUOTE;
			this.i = i;
		}
		writeValue(schema, value, container) {
			if (value == null) {
				if (container?.isStructSchema()) {
					if (value === void 0) {
						if (NormalizedSchema.of(schema).isIdempotencyToken()) {
							this.writeAsciiQuoted(generateIdempotencyToken());
							return;
						}
					}
					return;
				}
				this.ensure(4);
				this.json.set(NULL, this.i);
				this.i += 4;
				return;
			}
			const ns = NormalizedSchema.of(schema);
			const isObject = typeof value === "object";
			if (ns.isStringSchema()) {
				const mediaType = ns.getMergedTraits().mediaType;
				if (mediaType) {
					if (mediaType === "application/json" || mediaType.endsWith("+json")) {
						this.writeJsonString(LazyJsonString.from(value).toString());
						return;
					}
				}
			}
			if (isObject) {
				if (ns.isStructSchema()) {
					this.writeStruct(ns, value);
					return;
				}
				if (Array.isArray(value) && (ns.isListSchema() || ns.isDocumentSchema())) {
					this.writeList(ns, value, ns.isDocumentSchema());
					return;
				}
				if (ns.isMapSchema()) {
					this.writeMap(ns, value, false);
					return;
				}
				if (value instanceof Uint8Array && (ns.isBlobSchema() || ns.isDocumentSchema())) {
					this.writeBase64(value);
					return;
				}
				if (value instanceof Date && (ns.isTimestampSchema() || ns.isDocumentSchema())) {
					this.writeTimestamp(ns, value);
					return;
				}
				if (value instanceof NumericValue) {
					this.writeAscii(value.string);
					return;
				}
				if (ns.isDocumentSchema()) {
					if (Array.isArray(value)) this.writeList(ns, value, true);
					else this.writeMap(ns, value, true);
					return;
				}
				const json = JSON.stringify(value);
				this.writeAscii(json);
				return;
			}
			if (typeof value === "string") {
				if (ns.isBlobSchema()) {
					const b64 = (this.serdeContext?.base64Encoder ?? toBase64$1)(value);
					this.writeAsciiQuoted(b64);
					return;
				}
				this.writeJsonString(value);
				return;
			}
			if (typeof value === "number") {
				if (Math.abs(value) === Infinity || Number.isNaN(value)) {
					this.writeAsciiQuoted(String(value));
					return;
				}
				const numStr = String(value);
				this.writeAscii(numStr);
				return;
			}
			if (typeof value === "boolean") {
				this.ensure(5);
				let { i, json } = this;
				if (value) {
					json.set(TRUE, i);
					i += 4;
				} else {
					json.set(FALSE, i);
					i += 5;
				}
				this.i = i;
				return;
			}
			if (typeof value === "bigint") {
				this.writeAscii(value.toString());
				return;
			}
			this.writeAscii(String(value));
		}
		writeStruct(ns, value) {
			this.ensure(2);
			this.json[this.i++] = OPEN_BRACE;
			let wroteAny = false;
			const hasType = typeof value.__type === "string";
			let writtenKeys;
			if (hasType) writtenKeys = /* @__PURE__ */ new Set();
			for (const [memberName, memberSchema] of ns.structIterator()) {
				const item = value[memberName];
				if (item == null && !memberSchema.isIdempotencyToken()) continue;
				if (wroteAny) {
					this.ensure(1);
					this.json[this.i++] = COMMA;
				}
				wroteAny = true;
				const targetKey = this.settings.jsonName ? memberSchema.getMergedTraits().jsonName ?? memberName : memberName;
				if (writtenKeys) {
					writtenKeys.add(memberName);
					writtenKeys.add(targetKey);
				}
				this.writeAsciiQuoted(targetKey);
				this.json[this.i++] = COLON;
				this.writeValue(memberSchema, item, ns);
			}
			if (!wroteAny && ns.isUnionSchema()) {
				const { $unknown } = value;
				if (Array.isArray($unknown)) {
					const [k, v] = $unknown;
					this.writeAsciiQuoted(k);
					this.ensure(1);
					this.json[this.i++] = COLON;
					this.writeValue(15, v, ns);
				}
			} else if (hasType) for (const k in value) {
				if (writtenKeys.has(k)) continue;
				writtenKeys.add(k);
				const v = value[k];
				if (wroteAny) {
					this.ensure(1);
					this.json[this.i++] = COMMA;
				}
				wroteAny = true;
				this.writeAsciiQuoted(k);
				this.ensure(1);
				this.json[this.i++] = COLON;
				this.writeValue(15, v, void 0);
			}
			this.ensure(1);
			this.json[this.i++] = CLOSE_BRACE;
		}
		writeList(ns, value, isDocument) {
			const sparse = !!ns.getMergedTraits().sparse;
			const valueSchema = ns.getValueSchema();
			if (!isDocument) {
				if (valueSchema.isStringSchema() || valueSchema.isNumericSchema() || valueSchema.isBooleanSchema()) {
					let hasSpecials = false;
					for (let i = 0; i < value.length; ++i) {
						const v = value[i];
						if (Number.isNaN(v) || v === Infinity || v === -Infinity || v == null && !sparse) {
							hasSpecials = true;
							break;
						}
					}
					let json;
					if (!hasSpecials) json = JSON.stringify(value);
					else {
						const out = [];
						for (let i = 0; i < value.length; ++i) {
							const v = value[i];
							if (v == null && !sparse) continue;
							if (Number.isNaN(v) || v === Infinity || v === -Infinity) out.push(String(v));
							else out.push(v);
						}
						json = JSON.stringify(out);
					}
					this.ensure(json.length * 3);
					this.i += encoder.encodeInto(json, this.json.subarray(this.i)).written;
					return;
				}
			}
			this.ensure(2);
			this.json[this.i++] = OPEN_BRACKET;
			let wroteFirstItem = false;
			for (let i = 0; i < value.length; ++i) {
				const item = value[i];
				if (isDocument ? item === void 0 : item == null && !sparse) continue;
				if (wroteFirstItem) {
					this.ensure(1);
					this.json[this.i++] = COMMA;
				}
				this.writeValue(valueSchema, item, void 0);
				wroteFirstItem = true;
			}
			this.ensure(1);
			this.json[this.i++] = CLOSE_BRACKET;
		}
		writeMap(ns, value, isDocument) {
			const sparse = !!ns.getMergedTraits().sparse;
			const valueSchema = ns.getValueSchema();
			if (!isDocument) {
				if (valueSchema.isStringSchema() || valueSchema.isNumericSchema() || valueSchema.isBooleanSchema()) {
					let modifications;
					for (const k in value) {
						const v = value[k];
						if (Number.isNaN(v) || v === Infinity || v === -Infinity) {
							(modifications ??= {})[k] = v;
							value[k] = String(v);
						} else if (v === null && !sparse) {
							(modifications ??= {})[k] = null;
							value[k] = void 0;
						}
					}
					const json = JSON.stringify(value);
					if (modifications) Object.assign(value, modifications);
					this.ensure(json.length * 3);
					this.i += encoder.encodeInto(json, this.json.subarray(this.i)).written;
					return;
				}
			}
			this.ensure(2);
			this.json[this.i++] = OPEN_BRACE;
			let first = true;
			for (const k in value) {
				const v = value[k];
				if (isDocument ? v === void 0 : v == null && !sparse) continue;
				if (!first) {
					this.ensure(1);
					this.json[this.i++] = COMMA;
				}
				first = false;
				this.writeJsonString(k);
				this.ensure(1);
				this.json[this.i++] = COLON;
				this.writeValue(valueSchema, v, void 0);
			}
			this.ensure(1);
			this.json[this.i++] = CLOSE_BRACE;
		}
		writeTimestamp(ns, value) {
			switch (determineTimestampFormat(ns, this.settings)) {
				case 5: {
					const iso = value.toISOString().replace(".000Z", "Z");
					this.writeAsciiQuoted(iso);
					return;
				}
				case 6:
					this.writeAsciiQuoted(dateToUtcString(value));
					return;
				case 7: {
					const epochSecs = String(value.getTime() / 1e3);
					this.writeAscii(epochSecs);
					return;
				}
				default: {
					const epochSecs = String(value.getTime() / 1e3);
					this.writeAscii(epochSecs);
					return;
				}
			}
		}
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/protocols/json/codec-v2/JsonCodec2.js
var JsonCodec2;
var init_JsonCodec2 = __esmMin((() => {
	init_ConfigurableSerdeContext();
	init_JsonShapeDeserializer2();
	init_JsonShapeSerializer2();
	JsonCodec2 = class extends SerdeContextConfig {
		settings;
		constructor(settings) {
			super();
			this.settings = settings;
		}
		createSerializer() {
			const serializer = new JsonShapeSerializer2(this.settings);
			serializer.setSerdeContext(this.serdeContext);
			return serializer;
		}
		createDeserializer() {
			const deserializer = new JsonShapeDeserializer2(this.settings);
			deserializer.setSerdeContext(this.serdeContext);
			return deserializer;
		}
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/protocols/json/AwsRestJsonProtocol.js
var AwsRestJsonProtocol;
var init_AwsRestJsonProtocol = __esmMin((() => {
	init_protocols$1();
	init_schema();
	init_ProtocolLib();
	init_JsonCodec2();
	init_parseJsonBody();
	AwsRestJsonProtocol = class extends HttpBindingProtocol {
		serializer;
		deserializer;
		codec;
		mixin = new ProtocolLib();
		constructor({ defaultNamespace, errorTypeRegistries, jsonCodec }) {
			super({
				defaultNamespace,
				errorTypeRegistries
			});
			const settings = {
				timestampFormat: {
					useTrait: true,
					default: 7
				},
				httpBindings: true,
				jsonName: true
			};
			this.codec = jsonCodec ?? new JsonCodec2(settings);
			this.serializer = new HttpInterceptingShapeSerializer(this.codec.createSerializer(), settings);
			this.deserializer = new HttpInterceptingShapeDeserializer(this.codec.createDeserializer(), settings);
		}
		getShapeId() {
			return "aws.protocols#restJson1";
		}
		getPayloadCodec() {
			return this.codec;
		}
		setSerdeContext(serdeContext) {
			this.codec.setSerdeContext(serdeContext);
			super.setSerdeContext(serdeContext);
		}
		async serializeRequest(operationSchema, input, context) {
			const request = await super.serializeRequest(operationSchema, input, context);
			const inputSchema = NormalizedSchema.of(operationSchema.input);
			if (!request.headers["content-type"]) {
				const contentType = this.mixin.resolveRestContentType(this.getDefaultContentType(), inputSchema);
				if (contentType) request.headers["content-type"] = contentType;
			}
			if (request.body == null && request.headers["content-type"] === this.getDefaultContentType()) request.body = "{}";
			return request;
		}
		async deserializeResponse(operationSchema, context, response) {
			const output = await super.deserializeResponse(operationSchema, context, response);
			const outputSchema = NormalizedSchema.of(operationSchema.output);
			for (const [name, member] of outputSchema.structIterator()) if (member.getMemberTraits().httpPayload && !(name in output)) output[name] = null;
			return output;
		}
		async handleError(operationSchema, context, response, dataObject, metadata) {
			const errorIdentifier = loadRestJsonErrorCode(response, dataObject) ?? "Unknown";
			this.mixin.compose(this.compositeErrorRegistry, errorIdentifier, this.options.defaultNamespace);
			const { errorSchema, errorMetadata } = await this.mixin.getErrorSchemaOrThrowBaseException(errorIdentifier, this.options.defaultNamespace, response, dataObject, metadata);
			const ns = NormalizedSchema.of(errorSchema);
			const message = dataObject.message ?? dataObject.Message ?? "UnknownError";
			const exception = new ((this.compositeErrorRegistry.getErrorCtor(errorSchema)) ?? Error)({});
			await this.deserializeHttpMessage(errorSchema, context, response, dataObject);
			const output = {};
			const errorDeserializer = this.codec.createDeserializer();
			for (const [name, member] of ns.structIterator()) {
				const target = member.getMergedTraits().jsonName ?? name;
				output[name] = errorDeserializer.readObject(member, dataObject[target]);
			}
			throw this.mixin.decorateServiceException(Object.assign(exception, errorMetadata, {
				$fault: ns.getMergedTraits().error,
				message
			}, output), dataObject);
		}
		getDefaultContentType() {
			return "application/json";
		}
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/xml-builder/dist-es/escape-attribute.js
function escapeAttribute(value) {
	return value.replace(ATTR_ESCAPE_RE, (ch) => ATTR_ESCAPE_MAP[ch]);
}
var ATTR_ESCAPE_RE, ATTR_ESCAPE_MAP;
var init_escape_attribute = __esmMin((() => {
	ATTR_ESCAPE_RE = /[&<>"]/g;
	ATTR_ESCAPE_MAP = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		"\"": "&quot;"
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/xml-builder/dist-es/escape-element.js
function escapeElement(value) {
	return value.replace(ELEMENT_ESCAPE_RE, (ch) => ELEMENT_ESCAPE_MAP[ch]);
}
var ELEMENT_ESCAPE_RE, ELEMENT_ESCAPE_MAP;
var init_escape_element = __esmMin((() => {
	ELEMENT_ESCAPE_RE = /[&"'<>\r\n\u0085\u2028]/g;
	ELEMENT_ESCAPE_MAP = {
		"&": "&amp;",
		"\"": "&quot;",
		"'": "&apos;",
		"<": "&lt;",
		">": "&gt;",
		"\r": "&#x0D;",
		"\n": "&#x0A;",
		"": "&#x85;",
		"\u2028": "&#x2028;"
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/xml-builder/dist-es/XmlText.js
var XmlText;
var init_XmlText = __esmMin((() => {
	init_escape_element();
	XmlText = class {
		value;
		constructor(value) {
			this.value = value;
		}
		toString() {
			return escapeElement("" + this.value);
		}
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/xml-builder/dist-es/XmlNode.js
var XmlNode;
var init_XmlNode = __esmMin((() => {
	init_escape_attribute();
	init_XmlText();
	XmlNode = class XmlNode {
		name;
		children;
		attributes = {};
		static of(name, childText, withName) {
			const node = new XmlNode(name);
			if (childText !== void 0) node.addChildNode(new XmlText(childText));
			if (withName !== void 0) node.withName(withName);
			return node;
		}
		constructor(name, children = []) {
			this.name = name;
			this.children = children;
		}
		withName(name) {
			this.name = name;
			return this;
		}
		addAttribute(name, value) {
			this.attributes[name] = value;
			return this;
		}
		addChildNode(child) {
			this.children.push(child);
			return this;
		}
		removeAttribute(name) {
			delete this.attributes[name];
			return this;
		}
		n(name) {
			this.name = name;
			return this;
		}
		c(child) {
			this.children.push(child);
			return this;
		}
		a(name, value) {
			if (value != null) this.attributes[name] = value;
			return this;
		}
		cc(input, field, withName = field) {
			if (input[field] != null) {
				const node = XmlNode.of(field, input[field]).withName(withName);
				this.c(node);
			}
		}
		l(input, listName, memberName, valueProvider) {
			if (input[listName] != null) valueProvider().map((node) => {
				node.withName(memberName);
				this.c(node);
			});
		}
		lc(input, listName, memberName, valueProvider) {
			if (input[listName] != null) {
				const nodes = valueProvider();
				const containerNode = new XmlNode(memberName);
				nodes.map((node) => {
					containerNode.c(node);
				});
				this.c(containerNode);
			}
		}
		toString() {
			const hasChildren = Boolean(this.children.length);
			let xmlText = `<${this.name}`;
			const attributes = this.attributes;
			for (const attributeName of Object.keys(attributes)) {
				const attribute = attributes[attributeName];
				if (attribute != null) xmlText += ` ${attributeName}="${escapeAttribute("" + attribute)}"`;
			}
			return xmlText += !hasChildren ? "/>" : `>${this.children.map((c) => c.toString()).join("")}</${this.name}>`;
		}
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/xml-builder/dist-es/xml-parser.js
function writeKey(obj) {
	Object.defineProperty(obj, "__proto__", {
		value: void 0,
		writable: true,
		enumerable: true,
		configurable: true
	});
}
function parseXML(xml) {
	return new AwsXmlParser(xml).parse();
}
var AwsXmlParser;
var init_xml_parser = __esmMin((() => {
	AwsXmlParser = class AwsXmlParser {
		x;
		i = 0;
		z;
		constructor(x) {
			this.x = x;
			this.x = x.replace(/\r\n?/g, "\n");
			this.z = this.x.length;
		}
		parse() {
			const p = this;
			const { z } = p;
			while (p.i < z) {
				p.trim();
				if (p.i >= z) break;
				if (p.isNext("<?")) {
					p.readTo("?>");
					p.trim();
				} else if (p.isNext("<!--")) {
					p.readTo("-->");
					p.trim();
				} else if (p.isNext("<!DOCTYPE", false)) {
					p.skipDoctype();
					p.trim();
				} else if (p.x[p.i] === "<") {
					const root = p.parseTag();
					return { [root.tag]: root.value };
				} else throw new Error("@aws-sdk XML parse error: unexpected content.");
			}
			throw new Error("@aws-sdk XML parse error: no root element.");
		}
		isNext(s, caseSensitive = true) {
			const p = this;
			if (caseSensitive) return p.x.startsWith(s, p.i);
			return p.x.toLowerCase().startsWith(s.toLowerCase(), p.i);
		}
		readTo(stop) {
			const p = this;
			const _i = p.x.indexOf(stop, p.i);
			if (_i === -1) throw new Error(`@aws-sdk XML parse error: expected "${stop}" not found.`);
			const result = p.x.slice(p.i, _i);
			p.i = _i + stop.length;
			return result;
		}
		trim() {
			const p = this;
			while (p.i < p.z && " 	\r\n".includes(p.x[p.i])) ++p.i;
		}
		readAttrValue() {
			const p = this;
			const quote = p.x[p.i];
			++p.i;
			let value = "";
			while (p.i < p.z && p.x[p.i] !== quote) value += p.x[p.i++];
			++p.i;
			return p.decodeEntities(value);
		}
		parseTag() {
			const p = this;
			++p.i;
			let tag = "";
			while (p.i < p.z && !" 	\r\n>/".includes(p.x[p.i])) tag += p.x[p.i++];
			let hasAttrs = false;
			const attrs = {};
			while (p.i < p.z) {
				p.trim();
				if (">/".includes(p.x[p.i])) break;
				let name = "";
				while (p.i < p.z && !"= 	\r\n>/?".includes(p.x[p.i])) name += p.x[p.i++];
				p.trim();
				if (p.x[p.i] !== "=") break;
				++p.i;
				p.trim();
				if (name === "__proto__") writeKey(attrs);
				attrs[name] = p.readAttrValue();
				hasAttrs = true;
			}
			if (p.i >= p.z) throw new Error("@aws-sdk XML parse error: unexpected end of input.");
			if (p.x[p.i] === "/") {
				++p.i;
				if (p.i >= p.z || p.x[p.i] !== ">") throw new Error("@aws-sdk XML parse error: expected > at the end of self-closing tag.");
				++p.i;
				return {
					tag,
					value: hasAttrs ? attrs : ""
				};
			}
			if (p.x[p.i] !== ">") throw new Error("@aws-sdk XML parse error: expected > at the end of opening tag.");
			++p.i;
			const textParts = [];
			const childTags = [];
			let hasElementChild = false;
			while (p.i < p.z) {
				if (p.isNext("</")) break;
				if (p.x[p.i] === "<") {
					if (p.isNext("<!--")) p.readTo("-->");
					else if (p.isNext("<![CDATA[")) {
						p.i += 9;
						textParts.push(p.readTo("]]>"));
					} else if (p.isNext("<?")) p.readTo("?>");
					else {
						hasElementChild = true;
						childTags.push(p.parseTag());
					}
				} else {
					let text = "";
					while (p.i < p.z && p.x[p.i] !== "<") text += p.x[p.i++];
					textParts.push(p.decodeEntities(text));
				}
			}
			if (!p.isNext("</")) throw new Error(`@aws-sdk XML parse error: missing closing tag </${tag}>.`);
			p.i += 2;
			const closeTag = p.readTo(">").trim();
			if (closeTag !== tag) throw new Error(`@aws-sdk XML parse error: mismatched tags <${tag}> and </${closeTag}>.`);
			if (!hasAttrs && textParts.length === 0 && !hasElementChild) return {
				tag,
				value: ""
			};
			if (!hasAttrs && !hasElementChild) {
				const text = textParts.length === 1 ? textParts[0] : textParts.join("");
				if (text.trim() === "" && text.includes("\n")) return {
					tag,
					value: ""
				};
				return {
					tag,
					value: text
				};
			}
			const obj = {};
			for (const text of textParts) {
				if (text.trim() === "" && text.includes("\n")) continue;
				obj["#text"] = "#text" in obj ? obj["#text"] + text : text;
			}
			for (const child of childTags) {
				if (child.tag === "__proto__") writeKey(obj);
				if (child.tag in obj) {
					if (Array.isArray(obj[child.tag])) obj[child.tag].push(child.value);
					else obj[child.tag] = [obj[child.tag], child.value];
				} else obj[child.tag] = child.value;
			}
			for (const [k, v] of Object.entries(attrs)) {
				if (k === "__proto__") writeKey(obj);
				obj[k] = v;
			}
			return {
				tag,
				value: obj
			};
		}
		static ENTITIES = {
			amp: "&",
			lt: "<",
			gt: ">",
			quot: "\"",
			apos: "'"
		};
		skipDoctype() {
			const p = this;
			p.i += 9;
			let depth = 0;
			while (p.i < p.z) {
				const c = p.x[p.i];
				if (c === "[") ++depth;
				else if (c === "]") --depth;
				else if (c === ">" && depth === 0) {
					++p.i;
					return;
				}
				++p.i;
			}
			throw new Error("@aws-sdk XML parse error: unclosed DOCTYPE.");
		}
		decodeEntities(s) {
			return s.replace(/&(?:#x([0-9a-fA-F]{1,6})|#(\d{1,7})|([a-zA-Z][a-zA-Z0-9]{0,30}));/g, (_, hex, dec, named) => {
				if (hex) return String.fromCharCode(parseInt(hex, 16));
				if (dec) return String.fromCharCode(parseInt(dec, 10));
				return AwsXmlParser.ENTITIES[named] ?? "";
			});
		}
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/xml-builder/dist-es/index.js
var init_dist_es$10 = __esmMin((() => {
	init_XmlNode();
	init_XmlText();
	init_xml_parser();
}));
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/protocols/xml/XmlShapeDeserializer.js
var XmlShapeDeserializer;
var init_XmlShapeDeserializer = __esmMin((() => {
	init_dist_es$10();
	init_client$1();
	init_protocols$1();
	init_schema();
	init_serde();
	init_ConfigurableSerdeContext();
	init_UnionSerde();
	init_writeKey();
	XmlShapeDeserializer = class extends SerdeContextConfig {
		settings;
		stringDeserializer;
		constructor(settings) {
			super();
			this.settings = settings;
			this.stringDeserializer = new FromStringShapeDeserializer(settings);
		}
		setSerdeContext(serdeContext) {
			this.serdeContext = serdeContext;
			this.stringDeserializer.setSerdeContext(serdeContext);
		}
		read(schema, bytes, key) {
			const ns = NormalizedSchema.of(schema);
			const memberSchemas = ns.getMemberSchemas();
			if (ns.isStructSchema() && ns.isMemberSchema() && !!Object.values(memberSchemas).find((memberNs) => {
				return !!memberNs.getMemberTraits().eventPayload;
			})) {
				const output = {};
				const memberName = Object.keys(memberSchemas)[0];
				if (memberSchemas[memberName].isBlobSchema()) output[memberName] = bytes;
				else output[memberName] = this.read(memberSchemas[memberName], bytes);
				return output;
			}
			const xmlString = (this.serdeContext?.utf8Encoder ?? toUtf8$1)(bytes);
			const parsedObject = this.parseXml(xmlString);
			return this.readSchema(schema, key ? parsedObject[key] : parsedObject);
		}
		readSchema(_schema, value) {
			const ns = NormalizedSchema.of(_schema);
			if (ns.isUnitSchema()) return;
			const traits = ns.getMergedTraits();
			if (ns.isListSchema() && !Array.isArray(value)) return this.readSchema(ns, [value]);
			if (value == null) return value;
			if (typeof value === "object") {
				const flat = !!traits.xmlFlattened;
				if (ns.isListSchema()) {
					const listValue = ns.getValueSchema();
					const buffer = [];
					const sourceKey = listValue.getMergedTraits().xmlName ?? "member";
					const source = flat ? value : (value[0] ?? value)[sourceKey];
					if (source == null) return buffer;
					const sourceArray = Array.isArray(source) ? source : [source];
					for (const v of sourceArray) buffer.push(this.readSchema(listValue, v));
					return buffer;
				}
				const buffer = {};
				if (ns.isMapSchema()) {
					const keyNs = ns.getKeySchema();
					const memberNs = ns.getValueSchema();
					let entries;
					if (flat) entries = Array.isArray(value) ? value : [value];
					else entries = Array.isArray(value.entry) ? value.entry : [value.entry];
					const keyProperty = keyNs.getMergedTraits().xmlName ?? "key";
					const valueProperty = memberNs.getMergedTraits().xmlName ?? "value";
					for (const entry of entries) {
						const key = entry[keyProperty];
						const value = entry[valueProperty];
						if (key === "__proto__") writeKey$1(buffer);
						buffer[key] = this.readSchema(memberNs, value);
					}
					return buffer;
				}
				if (ns.isStructSchema()) {
					const union = ns.isUnionSchema();
					let unionSerde;
					if (union) unionSerde = new UnionSerde(value, buffer);
					for (const [memberName, memberSchema] of ns.structIterator()) {
						const memberTraits = memberSchema.getMergedTraits();
						const xmlObjectKey = !memberTraits.httpPayload ? memberSchema.getMemberTraits().xmlName ?? memberName : memberTraits.xmlName ?? memberSchema.getName();
						if (union) unionSerde.mark(xmlObjectKey);
						if (value[xmlObjectKey] != null) buffer[memberName] = this.readSchema(memberSchema, value[xmlObjectKey]);
					}
					if (union) unionSerde.writeUnknown();
					return buffer;
				}
				if (ns.isDocumentSchema()) return value;
				throw new Error(`@aws-sdk/core/protocols - xml deserializer unhandled schema type for ${ns.getName(true)}`);
			}
			if (ns.isListSchema()) return [];
			if (ns.isMapSchema() || ns.isStructSchema()) return {};
			return this.stringDeserializer.read(ns, value);
		}
		parseXml(xml) {
			if (xml.length) {
				let parsedObj;
				try {
					parsedObj = parseXML(xml);
				} catch (e) {
					if (e && typeof e === "object") Object.defineProperty(e, "$responseBodyText", { value: xml });
					throw e;
				}
				const textNodeName = "#text";
				const key = Object.keys(parsedObj)[0];
				const parsedObjToReturn = parsedObj[key];
				if (parsedObjToReturn[textNodeName]) {
					parsedObjToReturn[key] = parsedObjToReturn[textNodeName];
					delete parsedObjToReturn[textNodeName];
				}
				return getValueFromTextNode(parsedObjToReturn);
			}
			return {};
		}
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/protocols/query/QueryShapeSerializer.js
var QueryShapeSerializer;
var init_QueryShapeSerializer = __esmMin((() => {
	init_protocols$1();
	init_schema();
	init_serde();
	init_ConfigurableSerdeContext();
	QueryShapeSerializer = class extends SerdeContextConfig {
		settings;
		buffer;
		constructor(settings) {
			super();
			this.settings = settings;
		}
		write(schema, value, prefix = "") {
			if (this.buffer === void 0) this.buffer = "";
			const ns = NormalizedSchema.of(schema);
			if (prefix && !prefix.endsWith(".")) prefix += ".";
			if (ns.isBlobSchema()) {
				if (typeof value === "string" || value instanceof Uint8Array) {
					this.writeKey(prefix);
					this.writeValue((this.serdeContext?.base64Encoder ?? toBase64$1)(value));
				}
			} else if (ns.isBooleanSchema() || ns.isNumericSchema() || ns.isStringSchema()) {
				if (value != null) {
					this.writeKey(prefix);
					this.writeValue(String(value));
				} else if (ns.isIdempotencyToken()) {
					this.writeKey(prefix);
					this.writeValue(generateIdempotencyToken());
				}
			} else if (ns.isBigIntegerSchema()) {
				if (value != null) {
					this.writeKey(prefix);
					this.writeValue(String(value));
				}
			} else if (ns.isBigDecimalSchema()) {
				if (value != null) {
					this.writeKey(prefix);
					this.writeValue(value instanceof NumericValue ? value.string : String(value));
				}
			} else if (ns.isTimestampSchema()) {
				if (value instanceof Date) {
					this.writeKey(prefix);
					switch (determineTimestampFormat(ns, this.settings)) {
						case 5:
							this.writeValue(value.toISOString().replace(".000Z", "Z"));
							break;
						case 6:
							this.writeValue(dateToUtcString(value));
							break;
						case 7: this.writeValue(String(value.getTime() / 1e3));
					}
				}
			} else if (ns.isDocumentSchema()) {
				if (Array.isArray(value)) this.write(79, value, prefix);
				else if (value instanceof Date) this.write(4, value, prefix);
				else if (value instanceof Uint8Array) this.write(21, value, prefix);
				else if (value && typeof value === "object") this.write(143, value, prefix);
				else {
					this.writeKey(prefix);
					this.writeValue(String(value));
				}
			} else if (ns.isListSchema()) {
				if (Array.isArray(value)) {
					if (value.length === 0) {
						if (this.settings.serializeEmptyLists) {
							this.writeKey(prefix);
							this.writeValue("");
						}
					} else {
						const member = ns.getValueSchema();
						const flat = this.settings.flattenLists || ns.getMergedTraits().xmlFlattened;
						let i = 1;
						for (const item of value) {
							if (item == null) continue;
							const traits = member.getMergedTraits();
							const suffix = this.getKey("member", traits.xmlName, traits.ec2QueryName);
							const key = flat ? `${prefix}${i}` : `${prefix}${suffix}.${i}`;
							this.write(member, item, key);
							++i;
						}
					}
				}
			} else if (ns.isMapSchema()) {
				if (value && typeof value === "object") {
					const keySchema = ns.getKeySchema();
					const memberSchema = ns.getValueSchema();
					const flat = ns.getMergedTraits().xmlFlattened;
					let i = 1;
					for (const k in value) {
						const v = value[k];
						if (v == null) continue;
						const keyTraits = keySchema.getMergedTraits();
						const keySuffix = this.getKey("key", keyTraits.xmlName, keyTraits.ec2QueryName);
						const key = flat ? `${prefix}${i}.${keySuffix}` : `${prefix}entry.${i}.${keySuffix}`;
						const valTraits = memberSchema.getMergedTraits();
						const valueSuffix = this.getKey("value", valTraits.xmlName, valTraits.ec2QueryName);
						const valueKey = flat ? `${prefix}${i}.${valueSuffix}` : `${prefix}entry.${i}.${valueSuffix}`;
						this.write(keySchema, k, key);
						this.write(memberSchema, v, valueKey);
						++i;
					}
				}
			} else if (ns.isStructSchema()) {
				if (value && typeof value === "object") {
					let didWriteMember = false;
					for (const [memberName, member] of ns.structIterator()) {
						if (value[memberName] == null && !member.isIdempotencyToken()) continue;
						const traits = member.getMergedTraits();
						const suffix = this.getKey(memberName, traits.xmlName, traits.ec2QueryName, "struct");
						const key = `${prefix}${suffix}`;
						this.write(member, value[memberName], key);
						didWriteMember = true;
					}
					if (!didWriteMember && ns.isUnionSchema()) {
						const { $unknown } = value;
						if (Array.isArray($unknown)) {
							const [k, v] = $unknown;
							const key = `${prefix}${k}`;
							this.write(15, v, key);
						}
					}
				}
			} else if (ns.isUnitSchema()) {} else throw new Error(`@aws-sdk/core/protocols - QuerySerializer unrecognized schema type ${ns.getName(true)}`);
		}
		flush() {
			if (this.buffer === void 0) throw new Error("@aws-sdk/core/protocols - QuerySerializer cannot flush with nothing written to buffer.");
			const str = this.buffer;
			delete this.buffer;
			return str;
		}
		getKey(memberName, xmlName, ec2QueryName, keySource) {
			const { ec2, capitalizeKeys } = this.settings;
			if (ec2 && ec2QueryName) return ec2QueryName;
			const key = xmlName ?? memberName;
			if (capitalizeKeys && keySource === "struct") return key[0].toUpperCase() + key.slice(1);
			return key;
		}
		writeKey(key) {
			if (key.endsWith(".")) key = key.slice(0, key.length - 1);
			this.buffer += `&${extendedEncodeURIComponent(key)}=`;
		}
		writeValue(value) {
			this.buffer += extendedEncodeURIComponent(value);
		}
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/protocols/query/AwsQueryProtocol.js
var AwsQueryProtocol;
var init_AwsQueryProtocol = __esmMin((() => {
	init_protocols$1();
	init_schema();
	init_ProtocolLib();
	init_XmlShapeDeserializer();
	init_QueryShapeSerializer();
	AwsQueryProtocol = class extends RpcProtocol {
		options;
		serializer;
		deserializer;
		mixin = new ProtocolLib();
		constructor(options) {
			super({
				defaultNamespace: options.defaultNamespace,
				errorTypeRegistries: options.errorTypeRegistries
			});
			this.options = options;
			const settings = {
				timestampFormat: {
					useTrait: true,
					default: 5
				},
				httpBindings: false,
				xmlNamespace: options.xmlNamespace,
				serviceNamespace: options.defaultNamespace,
				serializeEmptyLists: true
			};
			this.serializer = new QueryShapeSerializer(settings);
			this.deserializer = new XmlShapeDeserializer(settings);
		}
		getShapeId() {
			return "aws.protocols#awsQuery";
		}
		setSerdeContext(serdeContext) {
			this.serializer.setSerdeContext(serdeContext);
			this.deserializer.setSerdeContext(serdeContext);
		}
		getPayloadCodec() {
			throw new Error("AWSQuery protocol has no payload codec.");
		}
		async serializeRequest(operationSchema, input, context) {
			const request = await super.serializeRequest(operationSchema, input, context);
			if (!request.path.endsWith("/")) request.path += "/";
			request.headers["content-type"] = "application/x-www-form-urlencoded";
			if (deref(operationSchema.input) === "unit" || !request.body) request.body = "";
			request.body = `Action=${operationSchema.name.split("#")[1] ?? operationSchema.name}&Version=${this.options.version}` + request.body;
			if (request.body.endsWith("&")) request.body = request.body.slice(-1);
			return request;
		}
		async deserializeResponse(operationSchema, context, response) {
			const deserializer = this.deserializer;
			const ns = NormalizedSchema.of(operationSchema.output);
			const dataObject = {};
			if (response.statusCode >= 300) {
				const bytes = await collectBody$1(response.body, context);
				if (bytes.byteLength > 0) Object.assign(dataObject, await deserializer.read(15, bytes));
				await this.handleError(operationSchema, context, response, dataObject, this.deserializeMetadata(response));
			}
			for (const header in response.headers) {
				const value = response.headers[header];
				delete response.headers[header];
				response.headers[header.toLowerCase()] = value;
			}
			const shortName = operationSchema.name.split("#")[1] ?? operationSchema.name;
			const awsQueryResultKey = ns.isStructSchema() && this.useNestedResult() ? shortName + "Result" : void 0;
			const bytes = await collectBody$1(response.body, context);
			if (bytes.byteLength > 0) Object.assign(dataObject, await deserializer.read(ns, bytes, awsQueryResultKey));
			dataObject.$metadata = this.deserializeMetadata(response);
			return dataObject;
		}
		useNestedResult() {
			return true;
		}
		async handleError(operationSchema, context, response, dataObject, metadata) {
			const errorIdentifier = this.loadQueryErrorCode(response, dataObject) ?? "Unknown";
			this.mixin.compose(this.compositeErrorRegistry, errorIdentifier, this.options.defaultNamespace);
			const errorData = this.loadQueryError(dataObject) ?? {};
			const message = this.loadQueryErrorMessage(dataObject);
			errorData.message = message;
			errorData.Error = {
				Type: errorData.Type,
				Code: errorData.Code,
				Message: message
			};
			const { errorSchema, errorMetadata } = await this.mixin.getErrorSchemaOrThrowBaseException(errorIdentifier, this.options.defaultNamespace, response, errorData, metadata, this.mixin.findQueryCompatibleError);
			const ns = NormalizedSchema.of(errorSchema);
			const exception = new ((this.compositeErrorRegistry.getErrorCtor(errorSchema)) ?? Error)({});
			const output = {
				Type: errorData.Error.Type,
				Code: errorData.Error.Code,
				Error: errorData.Error
			};
			for (const [name, member] of ns.structIterator()) {
				const target = member.getMergedTraits().xmlName ?? name;
				const value = errorData[target] ?? dataObject[target];
				output[name] = this.deserializer.readSchema(member, value);
			}
			throw this.mixin.decorateServiceException(Object.assign(exception, errorMetadata, {
				$fault: ns.getMergedTraits().error,
				message
			}, output), dataObject);
		}
		loadQueryErrorCode(output, data) {
			const code = (data.Errors?.[0]?.Error ?? data.Errors?.Error ?? data.Error)?.Code;
			if (code !== void 0) return code;
			if (output.statusCode == 404) return "NotFound";
		}
		loadQueryError(data) {
			return data.Errors?.[0]?.Error ?? data.Errors?.Error ?? data.Error;
		}
		loadQueryErrorMessage(data) {
			const errorData = this.loadQueryError(data);
			return errorData?.message ?? errorData?.Message ?? data.message ?? data.Message ?? "Unknown";
		}
		getDefaultContentType() {
			return "application/x-www-form-urlencoded";
		}
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/protocols/xml/parseXmlBody.js
var loadRestXmlErrorCode;
var init_parseXmlBody = __esmMin((() => {
	loadRestXmlErrorCode = (output, data) => {
		if (data?.Error?.Code !== void 0) return data.Error.Code;
		if (data?.Code !== void 0) return data.Code;
		if (output.statusCode == 404) return "NotFound";
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/protocols/xml/XmlShapeSerializer.js
var XmlShapeSerializer;
var init_XmlShapeSerializer = __esmMin((() => {
	init_dist_es$10();
	init_protocols$1();
	init_schema();
	init_serde();
	init_ConfigurableSerdeContext();
	XmlShapeSerializer = class extends SerdeContextConfig {
		settings;
		stringBuffer;
		byteBuffer;
		buffer;
		constructor(settings) {
			super();
			this.settings = settings;
		}
		write(schema, value) {
			const ns = NormalizedSchema.of(schema);
			if (ns.isStringSchema() && typeof value === "string") this.stringBuffer = value;
			else if (ns.isBlobSchema()) this.byteBuffer = "byteLength" in value ? value : (this.serdeContext?.base64Decoder ?? fromBase64)(value);
			else {
				this.buffer = this.writeStruct(ns, value, void 0);
				const traits = ns.getMergedTraits();
				if (traits.httpPayload && !traits.xmlName) this.buffer.withName(ns.getName());
			}
		}
		flush() {
			if (this.byteBuffer !== void 0) {
				const bytes = this.byteBuffer;
				delete this.byteBuffer;
				return bytes;
			}
			if (this.stringBuffer !== void 0) {
				const str = this.stringBuffer;
				delete this.stringBuffer;
				return str;
			}
			const buffer = this.buffer;
			if (this.settings.xmlNamespace) {
				if (!buffer?.attributes?.["xmlns"]) buffer.addAttribute("xmlns", this.settings.xmlNamespace);
			}
			delete this.buffer;
			return buffer.toString();
		}
		writeStruct(ns, value, parentXmlns) {
			const traits = ns.getMergedTraits();
			const name = ns.isMemberSchema() && !traits.httpPayload ? ns.getMemberTraits().xmlName ?? ns.getMemberName() : traits.xmlName ?? ns.getName();
			if (!name || !ns.isStructSchema()) throw new Error(`@aws-sdk/core/protocols - xml serializer, cannot write struct with empty name or non-struct, schema=${ns.getName(true)}.`);
			const structXmlNode = XmlNode.of(name);
			const [xmlnsAttr, xmlns] = this.getXmlnsAttribute(ns, parentXmlns);
			for (const [memberName, memberSchema] of ns.structIterator()) {
				const val = value[memberName];
				if (val != null || memberSchema.isIdempotencyToken()) {
					if (memberSchema.getMergedTraits().xmlAttribute) {
						structXmlNode.addAttribute(memberSchema.getMergedTraits().xmlName ?? memberName, this.writeSimple(memberSchema, val));
						continue;
					}
					if (memberSchema.isListSchema()) this.writeList(memberSchema, val, structXmlNode, xmlns);
					else if (memberSchema.isMapSchema()) this.writeMap(memberSchema, val, structXmlNode, xmlns);
					else if (memberSchema.isStructSchema()) structXmlNode.addChildNode(this.writeStruct(memberSchema, val, xmlns));
					else {
						const memberNode = XmlNode.of(memberSchema.getMergedTraits().xmlName ?? memberSchema.getMemberName());
						this.writeSimpleInto(memberSchema, val, memberNode, xmlns);
						structXmlNode.addChildNode(memberNode);
					}
				}
			}
			const { $unknown } = value;
			if ($unknown && ns.isUnionSchema() && Array.isArray($unknown) && Object.keys(value).length === 1) {
				const [k, v] = $unknown;
				const node = XmlNode.of(k);
				if (typeof v !== "string") {
					if (value instanceof XmlNode || value instanceof XmlText) structXmlNode.addChildNode(value);
					else throw new Error("@aws-sdk - $unknown union member in XML requires value of type string, @aws-sdk/xml-builder::XmlNode or XmlText.");
				}
				this.writeSimpleInto(0, v, node, xmlns);
				structXmlNode.addChildNode(node);
			}
			if (xmlns) structXmlNode.addAttribute(xmlnsAttr, xmlns);
			return structXmlNode;
		}
		writeList(listMember, array, container, parentXmlns) {
			if (!listMember.isMemberSchema()) throw new Error(`@aws-sdk/core/protocols - xml serializer, cannot write non-member list: ${listMember.getName(true)}`);
			const listTraits = listMember.getMergedTraits();
			const listValueSchema = listMember.getValueSchema();
			const listValueTraits = listValueSchema.getMergedTraits();
			const sparse = !!listValueTraits.sparse;
			const flat = !!listTraits.xmlFlattened;
			const [xmlnsAttr, xmlns] = this.getXmlnsAttribute(listMember, parentXmlns);
			const writeItem = (container, value) => {
				if (listValueSchema.isListSchema()) this.writeList(listValueSchema, Array.isArray(value) ? value : [value], container, xmlns);
				else if (listValueSchema.isMapSchema()) this.writeMap(listValueSchema, value, container, xmlns);
				else if (listValueSchema.isStructSchema()) {
					const struct = this.writeStruct(listValueSchema, value, xmlns);
					container.addChildNode(struct.withName(flat ? listTraits.xmlName ?? listMember.getMemberName() : listValueTraits.xmlName ?? "member"));
				} else {
					const listItemNode = XmlNode.of(flat ? listTraits.xmlName ?? listMember.getMemberName() : listValueTraits.xmlName ?? "member");
					this.writeSimpleInto(listValueSchema, value, listItemNode, xmlns);
					container.addChildNode(listItemNode);
				}
			};
			if (flat) {
				for (const value of array) if (sparse || value != null) writeItem(container, value);
			} else {
				const listNode = XmlNode.of(listTraits.xmlName ?? listMember.getMemberName());
				if (xmlns) listNode.addAttribute(xmlnsAttr, xmlns);
				for (const value of array) if (sparse || value != null) writeItem(listNode, value);
				container.addChildNode(listNode);
			}
		}
		writeMap(mapMember, map, container, parentXmlns, containerIsMap = false) {
			if (!mapMember.isMemberSchema()) throw new Error(`@aws-sdk/core/protocols - xml serializer, cannot write non-member map: ${mapMember.getName(true)}`);
			const mapTraits = mapMember.getMergedTraits();
			const mapKeySchema = mapMember.getKeySchema();
			const keyTag = mapKeySchema.getMergedTraits().xmlName ?? "key";
			const mapValueSchema = mapMember.getValueSchema();
			const mapValueTraits = mapValueSchema.getMergedTraits();
			const valueTag = mapValueTraits.xmlName ?? "value";
			const sparse = !!mapValueTraits.sparse;
			const flat = !!mapTraits.xmlFlattened;
			const [xmlnsAttr, xmlns] = this.getXmlnsAttribute(mapMember, parentXmlns);
			const addKeyValue = (entry, key, val) => {
				const keyNode = XmlNode.of(keyTag, key);
				const [keyXmlnsAttr, keyXmlns] = this.getXmlnsAttribute(mapKeySchema, xmlns);
				if (keyXmlns) keyNode.addAttribute(keyXmlnsAttr, keyXmlns);
				entry.addChildNode(keyNode);
				let valueNode = XmlNode.of(valueTag);
				if (mapValueSchema.isListSchema()) this.writeList(mapValueSchema, val, valueNode, xmlns);
				else if (mapValueSchema.isMapSchema()) this.writeMap(mapValueSchema, val, valueNode, xmlns, true);
				else if (mapValueSchema.isStructSchema()) valueNode = this.writeStruct(mapValueSchema, val, xmlns);
				else this.writeSimpleInto(mapValueSchema, val, valueNode, xmlns);
				entry.addChildNode(valueNode);
			};
			if (flat) for (const key in map) {
				const val = map[key];
				if (sparse || val != null) {
					const entry = XmlNode.of(mapTraits.xmlName ?? mapMember.getMemberName());
					addKeyValue(entry, key, val);
					container.addChildNode(entry);
				}
			}
			else {
				let mapNode;
				if (!containerIsMap) {
					mapNode = XmlNode.of(mapTraits.xmlName ?? mapMember.getMemberName());
					if (xmlns) mapNode.addAttribute(xmlnsAttr, xmlns);
					container.addChildNode(mapNode);
				}
				for (const key in map) {
					const val = map[key];
					if (sparse || val != null) {
						const entry = XmlNode.of("entry");
						addKeyValue(entry, key, val);
						(containerIsMap ? container : mapNode).addChildNode(entry);
					}
				}
			}
		}
		writeSimple(_schema, value) {
			if (null === value) throw new Error("@aws-sdk/core/protocols - (XML serializer) cannot write null value.");
			const ns = NormalizedSchema.of(_schema);
			let nodeContents = null;
			if (value && typeof value === "object") {
				if (ns.isBlobSchema()) nodeContents = (this.serdeContext?.base64Encoder ?? toBase64$1)(value);
				else if (ns.isTimestampSchema() && value instanceof Date) switch (determineTimestampFormat(ns, this.settings)) {
					case 5:
						nodeContents = value.toISOString().replace(".000Z", "Z");
						break;
					case 6:
						nodeContents = dateToUtcString(value);
						break;
					case 7:
						nodeContents = String(value.getTime() / 1e3);
						break;
					default:
						console.warn("Missing timestamp format, using http date", value);
						nodeContents = dateToUtcString(value);
				}
				else if (ns.isBigDecimalSchema() && value) {
					if (value instanceof NumericValue) return value.string;
					return String(value);
				} else if (ns.isMapSchema() || ns.isListSchema()) throw new Error("@aws-sdk/core/protocols - xml serializer, cannot call _write() on List/Map schema, call writeList or writeMap() instead.");
				else throw new Error(`@aws-sdk/core/protocols - xml serializer, unhandled schema type for object value and schema: ${ns.getName(true)}`);
			}
			if (ns.isBooleanSchema() || ns.isNumericSchema() || ns.isBigIntegerSchema() || ns.isBigDecimalSchema()) nodeContents = String(value);
			if (ns.isStringSchema()) {
				if (value === void 0 && ns.isIdempotencyToken()) nodeContents = generateIdempotencyToken();
				else nodeContents = String(value);
			}
			if (nodeContents === null) throw new Error(`Unhandled schema-value pair ${ns.getName(true)}=${value}`);
			return nodeContents;
		}
		writeSimpleInto(_schema, value, into, parentXmlns) {
			const nodeContents = this.writeSimple(_schema, value);
			const ns = NormalizedSchema.of(_schema);
			const content = new XmlText(nodeContents);
			const [xmlnsAttr, xmlns] = this.getXmlnsAttribute(ns, parentXmlns);
			if (xmlns) into.addAttribute(xmlnsAttr, xmlns);
			into.addChildNode(content);
		}
		getXmlnsAttribute(ns, parentXmlns) {
			const [prefix, xmlns] = ns.getMergedTraits().xmlNamespace ?? [];
			if (xmlns && xmlns !== parentXmlns) return [prefix ? `xmlns:${prefix}` : "xmlns", xmlns];
			return [void 0, void 0];
		}
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/protocols/xml/XmlCodec.js
var XmlCodec;
var init_XmlCodec = __esmMin((() => {
	init_ConfigurableSerdeContext();
	init_XmlShapeDeserializer();
	init_XmlShapeSerializer();
	XmlCodec = class extends SerdeContextConfig {
		settings;
		constructor(settings) {
			super();
			this.settings = settings;
		}
		createSerializer() {
			const serializer = new XmlShapeSerializer(this.settings);
			serializer.setSerdeContext(this.serdeContext);
			return serializer;
		}
		createDeserializer() {
			const deserializer = new XmlShapeDeserializer(this.settings);
			deserializer.setSerdeContext(this.serdeContext);
			return deserializer;
		}
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/protocols/xml/AwsRestXmlProtocol.js
var AwsRestXmlProtocol;
var init_AwsRestXmlProtocol = __esmMin((() => {
	init_protocols$1();
	init_schema();
	init_ProtocolLib();
	init_parseXmlBody();
	init_XmlCodec();
	AwsRestXmlProtocol = class extends HttpBindingProtocol {
		codec;
		serializer;
		deserializer;
		mixin = new ProtocolLib();
		constructor(options) {
			super(options);
			const settings = {
				timestampFormat: {
					useTrait: true,
					default: 5
				},
				httpBindings: true,
				xmlNamespace: options.xmlNamespace,
				serviceNamespace: options.defaultNamespace
			};
			this.codec = new XmlCodec(settings);
			this.serializer = new HttpInterceptingShapeSerializer(this.codec.createSerializer(), settings);
			this.deserializer = new HttpInterceptingShapeDeserializer(this.codec.createDeserializer(), settings);
		}
		getPayloadCodec() {
			return this.codec;
		}
		getShapeId() {
			return "aws.protocols#restXml";
		}
		async serializeRequest(operationSchema, input, context) {
			const request = await super.serializeRequest(operationSchema, input, context);
			const inputSchema = NormalizedSchema.of(operationSchema.input);
			if (!request.headers["content-type"]) {
				const contentType = this.mixin.resolveRestContentType(this.getDefaultContentType(), inputSchema);
				if (contentType) request.headers["content-type"] = contentType;
			}
			if (typeof request.body === "string" && request.headers["content-type"] === this.getDefaultContentType() && !request.body.startsWith("<?xml ") && !this.hasUnstructuredPayloadBinding(inputSchema)) request.body = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" + request.body;
			return request;
		}
		async deserializeResponse(operationSchema, context, response) {
			return super.deserializeResponse(operationSchema, context, response);
		}
		async handleError(operationSchema, context, response, dataObject, metadata) {
			const errorIdentifier = loadRestXmlErrorCode(response, dataObject) ?? "Unknown";
			this.mixin.compose(this.compositeErrorRegistry, errorIdentifier, this.options.defaultNamespace);
			if (dataObject.Error && typeof dataObject.Error === "object") for (const key of Object.keys(dataObject.Error)) {
				dataObject[key] = dataObject.Error[key];
				if (key.toLowerCase() === "message") dataObject.message = dataObject.Error[key];
			}
			if (dataObject.RequestId && !metadata.requestId) metadata.requestId = dataObject.RequestId;
			const { errorSchema, errorMetadata } = await this.mixin.getErrorSchemaOrThrowBaseException(errorIdentifier, this.options.defaultNamespace, response, dataObject, metadata);
			const ns = NormalizedSchema.of(errorSchema);
			const message = dataObject.Error?.message ?? dataObject.Error?.Message ?? dataObject.message ?? dataObject.Message ?? "UnknownError";
			const exception = new ((this.compositeErrorRegistry.getErrorCtor(errorSchema)) ?? Error)({});
			await this.deserializeHttpMessage(errorSchema, context, response, dataObject);
			const output = {};
			const errorDeserializer = this.codec.createDeserializer();
			for (const [name, member] of ns.structIterator()) {
				const target = member.getMergedTraits().xmlName ?? name;
				const value = dataObject.Error?.[target] ?? dataObject[target];
				output[name] = errorDeserializer.readSchema(member, value);
			}
			throw this.mixin.decorateServiceException(Object.assign(exception, errorMetadata, {
				$fault: ns.getMergedTraits().error,
				message
			}, output), dataObject);
		}
		getDefaultContentType() {
			return "application/xml";
		}
		hasUnstructuredPayloadBinding(ns) {
			for (const [, member] of ns.structIterator()) if (member.getMergedTraits().httpPayload) return !(member.isStructSchema() || member.isMapSchema() || member.isListSchema());
			return false;
		}
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/protocols/index.js
var init_protocols = __esmMin((() => {
	init_serde();
	init_transport();
	init_protocols$1();
	init_schema();
	init_ProtocolLib();
	init_JsonCodec2();
	init_parseJsonBody();
	init_AwsRestJsonProtocol();
	init_ConfigurableSerdeContext();
	init_UnionSerde();
	init_jsonReviver();
	init_needsReviver();
	init_JsonShapeDeserializer2();
	init_JsonShapeSerializer2();
	init_AwsQueryProtocol();
	init_QueryShapeSerializer();
	init_AwsRestXmlProtocol();
	init_XmlCodec();
	init_XmlShapeDeserializer();
	init_XmlShapeSerializer();
	init_parseXmlBody();
}));
//#endregion
//#region ../../node_modules/@aws-sdk/middleware-sdk-s3/dist-es/submodules/s3/protocol/S3RestXmlProtocol.js
init_protocols();
init_schema();
var S3RestXmlProtocol = class extends AwsRestXmlProtocol {
	async serializeRequest(operationSchema, input, context) {
		const request = await super.serializeRequest(operationSchema, input, context);
		const ns = NormalizedSchema.of(operationSchema.input);
		const staticStructureSchema = ns.getSchema();
		let bucketMemberIndex = 0;
		const requiredMemberCount = staticStructureSchema[6] ?? 0;
		if (input && typeof input === "object") for (const [memberName, memberNs] of ns.structIterator()) {
			if (++bucketMemberIndex > requiredMemberCount) break;
			if (memberName === "Bucket") {
				if (!input.Bucket && memberNs.getMergedTraits().httpLabel) throw new Error(`No value provided for input HTTP label: Bucket.`);
				break;
			}
		}
		return request;
	}
};
//#endregion
//#region ../../node_modules/@aws-sdk/middleware-sdk-s3/dist-es/submodules/s3/NodeUseArnRegionConfigOptions.js
init_config$1();
var NODE_USE_ARN_REGION_ENV_NAME = "AWS_S3_USE_ARN_REGION";
var NODE_USE_ARN_REGION_INI_NAME = "s3_use_arn_region";
var NODE_USE_ARN_REGION_CONFIG_OPTIONS = {
	environmentVariableSelector: (env) => booleanSelector(env, NODE_USE_ARN_REGION_ENV_NAME, SelectorType.ENV),
	configFileSelector: (profile) => booleanSelector(profile, NODE_USE_ARN_REGION_INI_NAME, SelectorType.CONFIG),
	default: void 0
};
//#endregion
//#region ../../node_modules/@aws-sdk/middleware-sdk-s3/dist-es/submodules/s3/middleware-expect-continue/middleware-expect-continue.js
init_protocols$1();
function addExpectContinueMiddleware(options) {
	return (next) => async (args) => {
		const { request } = args;
		if (options.expectContinueHeader !== false && HttpRequest.isInstance(request) && request.body && options.runtime === "node" && options.requestHandler?.constructor?.name !== "FetchHttpHandler") {
			let sendHeader = true;
			if (typeof options.expectContinueHeader === "number") try {
				sendHeader = (Number(request.headers?.["content-length"]) ?? options.bodyLengthChecker?.(request.body) ?? Infinity) >= options.expectContinueHeader;
			} catch (e) {}
			else sendHeader = !!options.expectContinueHeader;
			if (sendHeader) request.headers.Expect = "100-continue";
		}
		return next({
			...args,
			request
		});
	};
}
var addExpectContinueMiddlewareOptions = {
	step: "build",
	tags: ["SET_EXPECT_HEADER", "EXPECT_HEADER"],
	name: "addExpectContinueMiddleware",
	override: true
};
var getAddExpectContinuePlugin = (options) => ({ applyToStack: (clientStack) => {
	clientStack.add(addExpectContinueMiddleware(options), addExpectContinueMiddlewareOptions);
} });
//#endregion
//#region ../../node_modules/@aws-sdk/middleware-sdk-s3/dist-es/submodules/s3/middleware-ssec/middleware-ssec.js
function ssecMiddleware(options) {
	return (next) => async (args) => {
		const input = { ...args.input };
		for (const prop of [{
			target: "SSECustomerKey",
			hash: "SSECustomerKeyMD5"
		}, {
			target: "CopySourceSSECustomerKey",
			hash: "CopySourceSSECustomerKeyMD5"
		}]) {
			const value = input[prop.target];
			if (value) {
				let valueForHash;
				if (typeof value === "string") {
					if (isValidBase64EncodedSSECustomerKey(value, options)) valueForHash = options.base64Decoder(value);
					else {
						valueForHash = options.utf8Decoder(value);
						input[prop.target] = options.base64Encoder(valueForHash);
					}
				} else {
					valueForHash = ArrayBuffer.isView(value) ? new Uint8Array(value.buffer, value.byteOffset, value.byteLength) : new Uint8Array(value);
					input[prop.target] = options.base64Encoder(valueForHash);
				}
				const hash = new options.md5();
				hash.update(valueForHash);
				input[prop.hash] = options.base64Encoder(await hash.digest());
			}
		}
		return next({
			...args,
			input
		});
	};
}
var ssecMiddlewareOptions = {
	name: "ssecMiddleware",
	step: "initialize",
	tags: ["SSE"],
	override: true
};
var getSsecPlugin = (config) => ({ applyToStack: (clientStack) => {
	clientStack.add(ssecMiddleware(config), ssecMiddlewareOptions);
} });
function isValidBase64EncodedSSECustomerKey(str, options) {
	if (!/^(?:[A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(str)) return false;
	try {
		return options.base64Decoder(str).length === 32;
	} catch {
		return false;
	}
}
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/utils/getDateHeader.js
var getDateHeader, getAgeHeader;
var init_getDateHeader = __esmMin((() => {
	init_protocols$1();
	getDateHeader = (response) => HttpResponse.isInstance(response) ? response.headers?.date ?? response.headers?.Date : void 0;
	getAgeHeader = (response) => HttpResponse.isInstance(response) ? response.headers?.age ?? response.headers?.Age : void 0;
}));
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/utils/getSkewCorrectedDate.js
var getSkewCorrectedDate;
var init_getSkewCorrectedDate = __esmMin((() => {
	getSkewCorrectedDate = (systemClockOffset) => new Date(Date.now() + systemClockOffset);
}));
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/utils/getUpdatedSystemClockOffset.js
var getUpdatedSystemClockOffset;
var init_getUpdatedSystemClockOffset = __esmMin((() => {
	getUpdatedSystemClockOffset = (clockTime, currentSystemClockOffset, timeRequestSent, ageHeader) => {
		if (ageHeader !== void 0) return currentSystemClockOffset;
		const serverTime = Date.parse(clockTime);
		const timeResponseReceived = Date.now();
		if (timeRequestSent !== void 0 && timeResponseReceived - timeRequestSent > 9e5) return currentSystemClockOffset;
		return timeRequestSent !== void 0 ? serverTime - (timeRequestSent + timeResponseReceived) / 2 : serverTime - timeResponseReceived;
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/utils/index.js
var init_utils = __esmMin((() => {
	init_getDateHeader();
	init_getSkewCorrectedDate();
	init_getUpdatedSystemClockOffset();
}));
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/aws_sdk/AwsSdkSigV4Signer.js
var throwSigningPropertyError, validateSigningProperties, AwsSdkSigV4Signer;
var init_AwsSdkSigV4Signer = __esmMin((() => {
	init_protocols$1();
	init_utils();
	throwSigningPropertyError = (name, property) => {
		if (!property) throw new Error(`Property \`${name}\` is not resolved for AWS SDK SigV4Auth`);
		return property;
	};
	validateSigningProperties = async (signingProperties) => {
		const context = throwSigningPropertyError("context", signingProperties.context);
		const config = throwSigningPropertyError("config", signingProperties.config);
		const authScheme = context.endpointV2?.properties?.authSchemes?.[0];
		return {
			config,
			signer: await throwSigningPropertyError("signer", config.signer)(authScheme),
			signingRegion: signingProperties?.signingRegion,
			signingRegionSet: signingProperties?.signingRegionSet,
			signingName: signingProperties?.signingName
		};
	};
	AwsSdkSigV4Signer = class {
		async sign(httpRequest, identity, signingProperties) {
			if (!HttpRequest.isInstance(httpRequest)) throw new Error("The request is not an instance of `HttpRequest` and cannot be signed");
			const validatedProps = await validateSigningProperties(signingProperties);
			const { config, signer } = validatedProps;
			let { signingRegion, signingName } = validatedProps;
			const handlerExecutionContext = signingProperties.context;
			if (handlerExecutionContext?.authSchemes?.length ?? false) {
				const [first, second] = handlerExecutionContext.authSchemes;
				if (first?.name === "sigv4a" && second?.name === "sigv4") {
					signingRegion = second?.signingRegion ?? signingRegion;
					signingName = second?.signingName ?? signingName;
				}
			}
			const noSkewCorrection = await config.disableClockSkewCorrection?.() === true;
			signingProperties._disableClockSkewCorrection = noSkewCorrection;
			if (!noSkewCorrection) {
				signingProperties._preRequestSystemClockOffset = config.systemClockOffset;
				signingProperties._requestSentAt = Date.now();
			}
			return await signer.sign(httpRequest, {
				signingDate: noSkewCorrection ? /* @__PURE__ */ new Date() : getSkewCorrectedDate(config.systemClockOffset),
				signingRegion,
				signingService: signingName
			});
		}
		errorHandler(signingProperties) {
			return (error) => {
				const errorException = error;
				if (!signingProperties._disableClockSkewCorrection) {
					const serverTime = errorException.ServerTime ?? getDateHeader(errorException.$response);
					if (serverTime) {
						const config = throwSigningPropertyError("config", signingProperties.config);
						const preRequestOffset = signingProperties._preRequestSystemClockOffset;
						const timeRequestSent = signingProperties._requestSentAt;
						const ageHeader = getAgeHeader(errorException.$response);
						const newOffset = getUpdatedSystemClockOffset(serverTime, config.systemClockOffset, timeRequestSent, ageHeader);
						config.systemClockOffset = newOffset;
						if (Math.abs(newOffset) >= 24e4 && (newOffset !== preRequestOffset || preRequestOffset !== void 0 && preRequestOffset !== newOffset) && errorException.$metadata) errorException.$metadata.clockSkewCorrected = true;
					}
				}
				throw error;
			};
		}
		successHandler(httpResponse, signingProperties) {
			if (signingProperties._disableClockSkewCorrection) return;
			const dateHeader = getDateHeader(httpResponse);
			if (dateHeader) {
				const config = throwSigningPropertyError("config", signingProperties.config);
				const timeRequestSent = signingProperties._requestSentAt;
				const ageHeader = getAgeHeader(httpResponse);
				config.systemClockOffset = getUpdatedSystemClockOffset(dateHeader, config.systemClockOffset, timeRequestSent, ageHeader);
			}
		}
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/aws_sdk/AwsSdkSigV4ASigner.js
var AwsSdkSigV4ASigner;
var init_AwsSdkSigV4ASigner = __esmMin((() => {
	init_protocols$1();
	init_utils();
	init_AwsSdkSigV4Signer();
	AwsSdkSigV4ASigner = class extends AwsSdkSigV4Signer {
		async sign(httpRequest, identity, signingProperties) {
			if (!HttpRequest.isInstance(httpRequest)) throw new Error("The request is not an instance of `HttpRequest` and cannot be signed");
			const { config, signer, signingRegion, signingRegionSet, signingName } = await validateSigningProperties(signingProperties);
			const multiRegionOverride = (await config.sigv4aSigningRegionSet?.() ?? signingRegionSet ?? [signingRegion]).join(",");
			const noSkewCorrection = await config.disableClockSkewCorrection?.() === true;
			signingProperties._disableClockSkewCorrection = noSkewCorrection;
			if (!noSkewCorrection) {
				signingProperties._preRequestSystemClockOffset = config.systemClockOffset;
				signingProperties._requestSentAt = Date.now();
			}
			return await signer.sign(httpRequest, {
				signingDate: noSkewCorrection ? /* @__PURE__ */ new Date() : getSkewCorrectedDate(config.systemClockOffset),
				signingRegion: multiRegionOverride,
				signingService: signingName
			});
		}
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/utils/getArrayForCommaSeparatedString.js
var getArrayForCommaSeparatedString;
var init_getArrayForCommaSeparatedString = __esmMin((() => {
	getArrayForCommaSeparatedString = (str) => typeof str === "string" && str.length > 0 ? str.split(",").map((item) => item.trim()) : [];
}));
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/utils/getBearerTokenEnvKey.js
var getBearerTokenEnvKey;
var init_getBearerTokenEnvKey = __esmMin((() => {
	getBearerTokenEnvKey = (signingName) => `AWS_BEARER_TOKEN_${signingName.replace(/[\s-]/g, "_").toUpperCase()}`;
}));
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/aws_sdk/NODE_AUTH_SCHEME_PREFERENCE_OPTIONS.js
var NODE_AUTH_SCHEME_PREFERENCE_ENV_KEY, NODE_AUTH_SCHEME_PREFERENCE_CONFIG_KEY, NODE_AUTH_SCHEME_PREFERENCE_OPTIONS;
var init_NODE_AUTH_SCHEME_PREFERENCE_OPTIONS = __esmMin((() => {
	init_getArrayForCommaSeparatedString();
	init_getBearerTokenEnvKey();
	NODE_AUTH_SCHEME_PREFERENCE_ENV_KEY = "AWS_AUTH_SCHEME_PREFERENCE";
	NODE_AUTH_SCHEME_PREFERENCE_CONFIG_KEY = "auth_scheme_preference";
	NODE_AUTH_SCHEME_PREFERENCE_OPTIONS = {
		environmentVariableSelector: (env, options) => {
			if (options?.signingName) {
				if (getBearerTokenEnvKey(options.signingName) in env) return ["httpBearerAuth"];
			}
			if (!(NODE_AUTH_SCHEME_PREFERENCE_ENV_KEY in env)) return void 0;
			return getArrayForCommaSeparatedString(env[NODE_AUTH_SCHEME_PREFERENCE_ENV_KEY]);
		},
		configFileSelector: (profile) => {
			if (!(NODE_AUTH_SCHEME_PREFERENCE_CONFIG_KEY in profile)) return void 0;
			return getArrayForCommaSeparatedString(profile[NODE_AUTH_SCHEME_PREFERENCE_CONFIG_KEY]);
		},
		default: []
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/aws_sdk/resolveAwsSdkSigV4AConfig.js
var resolveAwsSdkSigV4AConfig, NODE_SIGV4A_CONFIG_OPTIONS;
var init_resolveAwsSdkSigV4AConfig = __esmMin((() => {
	init_dist_es$13();
	init_config$1();
	resolveAwsSdkSigV4AConfig = (config) => {
		config.sigv4aSigningRegionSet = normalizeProvider(config.sigv4aSigningRegionSet);
		return config;
	};
	NODE_SIGV4A_CONFIG_OPTIONS = {
		environmentVariableSelector(env) {
			if (env.AWS_SIGV4A_SIGNING_REGION_SET) return env.AWS_SIGV4A_SIGNING_REGION_SET.split(",").map((_) => _.trim());
			throw new ProviderError("AWS_SIGV4A_SIGNING_REGION_SET not set in env.", { tryNextLink: true });
		},
		configFileSelector(profile) {
			if (profile.sigv4a_signing_region_set) return (profile.sigv4a_signing_region_set ?? "").split(",").map((_) => _.trim());
			throw new ProviderError("sigv4a_signing_region_set not set in profile.", { tryNextLink: true });
		},
		default: void 0
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/aws_sdk/resolveAwsSdkSigV4Config.js
function normalizeCredentialProvider(config, { credentials, credentialDefaultProvider }) {
	let credentialsProvider;
	if (credentials) {
		if (!credentials?.memoized) credentialsProvider = memoizeIdentityProvider(credentials, isIdentityExpired, doesIdentityRequireRefresh);
		else credentialsProvider = credentials;
	} else if (credentialDefaultProvider) credentialsProvider = normalizeProvider(credentialDefaultProvider(Object.assign({}, config, { parentClientConfig: config })));
	else credentialsProvider = async () => {
		throw new Error("@aws-sdk/core::resolveAwsSdkSigV4Config - `credentials` not provided and no credentialDefaultProvider was configured.");
	};
	credentialsProvider.memoized = true;
	return credentialsProvider;
}
function bindCallerConfig(config, credentialsProvider) {
	if (credentialsProvider.configBound) return credentialsProvider;
	const fn = async (options) => credentialsProvider({
		...options,
		callerClientConfig: config
	});
	fn.memoized = credentialsProvider.memoized;
	fn.configBound = true;
	return fn;
}
var bindResolveAwsSdkSigV4Config;
var init_resolveAwsSdkSigV4Config = __esmMin((() => {
	init_client();
	init_dist_es$13();
	init_dist_es$12();
	bindResolveAwsSdkSigV4Config = (defaultDisableClockSkewCorrection) => (config) => {
		let inputCredentials = config.credentials;
		let isUserSupplied = !!config.credentials;
		let resolvedCredentials = void 0;
		Object.defineProperty(config, "credentials", {
			set(credentials) {
				if (credentials && credentials !== inputCredentials && credentials !== resolvedCredentials) isUserSupplied = true;
				inputCredentials = credentials;
				const boundProvider = bindCallerConfig(config, normalizeCredentialProvider(config, {
					credentials: inputCredentials,
					credentialDefaultProvider: config.credentialDefaultProvider
				}));
				if (isUserSupplied && !boundProvider.attributed) {
					const isCredentialObject = typeof inputCredentials === "object" && inputCredentials !== null;
					resolvedCredentials = async (options) => {
						const attributedCreds = await boundProvider(options);
						if (isCredentialObject && (!attributedCreds.$source || Object.keys(attributedCreds.$source).length === 0)) return setCredentialFeature(attributedCreds, "CREDENTIALS_CODE", "e");
						return attributedCreds;
					};
					resolvedCredentials.memoized = boundProvider.memoized;
					resolvedCredentials.configBound = boundProvider.configBound;
					resolvedCredentials.attributed = true;
				} else resolvedCredentials = boundProvider;
			},
			get() {
				return resolvedCredentials;
			},
			enumerable: true,
			configurable: true
		});
		config.credentials = inputCredentials;
		const { signingEscapePath = true, systemClockOffset = config.systemClockOffset || 0, sha256 } = config;
		let signer;
		if (config.signer) signer = normalizeProvider(config.signer);
		else if (config.regionInfoProvider) signer = () => normalizeProvider(config.region)().then(async (region) => [await config.regionInfoProvider(region, {
			useFipsEndpoint: await config.useFipsEndpoint(),
			useDualstackEndpoint: await config.useDualstackEndpoint()
		}) || {}, region]).then(([regionInfo, region]) => {
			const { signingRegion, signingService } = regionInfo;
			config.signingRegion = config.signingRegion || signingRegion || region;
			config.signingName = config.signingName || signingService || config.serviceId;
			const params = {
				...config,
				credentials: config.credentials,
				region: config.signingRegion,
				service: config.signingName,
				sha256,
				uriEscapePath: signingEscapePath
			};
			return new (config.signerConstructor || SignatureV4)(params);
		});
		else signer = async (authScheme) => {
			authScheme = Object.assign({}, {
				name: "sigv4",
				signingName: config.signingName || config.defaultSigningName,
				signingRegion: await normalizeProvider(config.region)(),
				properties: {}
			}, authScheme);
			const signingRegion = authScheme.signingRegion;
			const signingService = authScheme.signingName;
			config.signingRegion = config.signingRegion || signingRegion;
			config.signingName = config.signingName || signingService || config.serviceId;
			const params = {
				...config,
				credentials: config.credentials,
				region: config.signingRegion,
				service: config.signingName,
				sha256,
				uriEscapePath: signingEscapePath
			};
			return new (config.signerConstructor || SignatureV4)(params);
		};
		return Object.assign(config, {
			systemClockOffset,
			signingEscapePath,
			signer,
			disableClockSkewCorrection: normalizeProvider(config.disableClockSkewCorrection ?? defaultDisableClockSkewCorrection)
		});
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/aws_sdk/index.js
var init_aws_sdk = __esmMin((() => {
	init_AwsSdkSigV4Signer();
	init_AwsSdkSigV4ASigner();
	init_NODE_AUTH_SCHEME_PREFERENCE_OPTIONS();
	init_resolveAwsSdkSigV4AConfig();
	init_resolveAwsSdkSigV4Config();
}));
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/aws_sdk/clock-skew-node-config.js
var ENV_DISABLE_CLOCK_SKEW_CORRECTION, CONFIG_DISABLE_CLOCK_SKEW_CORRECTION, NODE_DISABLE_CLOCK_SKEW_CORRECTION_CONFIG_OPTIONS;
var init_clock_skew_node_config = __esmMin((() => {
	init_config$1();
	ENV_DISABLE_CLOCK_SKEW_CORRECTION = "AWS_DISABLE_CLOCK_SKEW_CORRECTION";
	CONFIG_DISABLE_CLOCK_SKEW_CORRECTION = "disable_clock_skew_correction";
	NODE_DISABLE_CLOCK_SKEW_CORRECTION_CONFIG_OPTIONS = {
		environmentVariableSelector: (env) => booleanSelector(env, ENV_DISABLE_CLOCK_SKEW_CORRECTION, SelectorType.ENV),
		configFileSelector: (profile) => booleanSelector(profile, CONFIG_DISABLE_CLOCK_SKEW_CORRECTION, SelectorType.CONFIG),
		default: false
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/aws_sdk/clock-skew-defaults.js
var DEFAULT_DISABLE_CLOCK_SKEW_CORRECTION;
var init_clock_skew_defaults = __esmMin((() => {
	init_config$1();
	init_clock_skew_node_config();
	DEFAULT_DISABLE_CLOCK_SKEW_CORRECTION = loadConfig(NODE_DISABLE_CLOCK_SKEW_CORRECTION_CONFIG_OPTIONS);
}));
//#endregion
//#region ../../node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/index.js
var resolveAwsSdkSigV4Config;
var init_httpAuthSchemes = __esmMin((() => {
	init_aws_sdk();
	init_getBearerTokenEnvKey();
	init_clock_skew_defaults();
	resolveAwsSdkSigV4Config = bindResolveAwsSdkSigV4Config(DEFAULT_DISABLE_CLOCK_SKEW_CORRECTION);
}));
//#endregion
//#region ../../node_modules/@aws-sdk/client-s3/dist-es/endpoint/bdd.js
init_endpoints();
var aw = "ref";
var ax = "argv";
var ay = "backend";
var az = "authSchemes";
var aA = "disableDoubleEncoding";
var aB = "signingName";
var aC = "signingRegion";
var aD = "signingRegionSet";
var a$4 = -1;
var b$4 = true;
var c$4 = false;
var d$4 = "isSet";
var e$4 = "booleanEquals";
var f$4 = "stringEquals";
var g$4 = "coalesce";
var h$4 = "substring";
var i$4 = "";
var j$4 = "aws.partition";
var k$4 = "partitionResult";
var l$2 = "accessPointSuffix";
var m$2 = "regionPrefix";
var n$2 = (n) => "outpostId_ssa_" + n + i$4;
var o$2 = "hardwareType";
var p$2 = "ite";
var q$2 = "isValidHostLabel";
var s$1 = "sigv4";
var t = "aws.isVirtualHostableS3Bucket";
var u = "url";
var v = "getAttr";
var w = "bucketArn";
var x = "--";
var y = "arnType";
var z = "accesspoint";
var A = (n) => "accessPointName_ssa_" + n + i$4;
var B = "s3-object-lambda";
var C = "s3-outposts";
var D = "bucketPartition";
var E = "us-east-1";
var F = "outpostType";
var G = "name";
var H = "s3";
var I = "{url#scheme}://{Bucket}.{url#authority}{url#path}";
var J = "{url#scheme}://{url#authority}{url#path}";
var K$1 = "{url#scheme}://{url#authority}{url#normalizedPath}{Bucket}";
var L = "https://{Bucket}.s3-accelerate.{partitionResult#dnsSuffix}";
var M = "https://{Bucket}.s3.{partitionResult#dnsSuffix}";
var N = (n) => "{url#scheme}://{accessPointName_ssa_" + n + "}-{bucketArn#accountId}.{url#authority}{url#path}";
var O = (n) => "Invalid ARN: The access point name may only contain a-z, A-Z, 0-9 and `-`. Found: `{accessPointName_ssa_" + n + "}`";
var P = "sigv4a";
var Q = "{url#scheme}://{url#authority}{url#normalizedPath}{uri_encoded_bucket}";
var R = "https://s3.{partitionResult#dnsSuffix}/{uri_encoded_bucket}";
var S = "https://s3.{partitionResult#dnsSuffix}";
var T = { [aw]: "UseFIPS" };
var U = { [aw]: "UseDualStack" };
var V = { [aw]: "Bucket" };
var W = {
	"fn": v,
	[ax]: [{ [aw]: k$4 }, G]
};
var X = { [aw]: u };
var Y = { [aw]: "Region" };
var Z = { [aw]: w };
var aa = { [aw]: y };
var ab = { [aw]: "accessPointName_ssa_1" };
var ac = {
	"fn": v,
	[ax]: [Z, "region"]
};
var ad = { [aw]: o$2 };
var ae = {
	"fn": v,
	[ax]: [Z, "service"]
};
var af = {
	"fn": v,
	[ax]: [Z, "accountId"]
};
var ag = {
	[ay]: "S3Express",
	[az]: [{
		[aA]: true,
		[G]: "{_s3e_auth}",
		[aB]: "s3express",
		[aC]: "{Region}"
	}]
};
var ah = {
	[ay]: "S3Express",
	[az]: [{
		[aA]: true,
		[G]: s$1,
		[aB]: "s3express",
		[aC]: "{Region}"
	}]
};
var ai = { [az]: [{
	[aA]: true,
	[G]: P,
	[aB]: C,
	[aD]: ["*"]
}, {
	[aA]: true,
	[G]: s$1,
	[aB]: C,
	[aC]: "{Region}"
}] };
var aj = { [az]: [{
	[aA]: true,
	[G]: s$1,
	[aB]: H,
	[aC]: E
}] };
var ak = { [az]: [{
	[aA]: true,
	[G]: s$1,
	[aB]: H,
	[aC]: "{Region}"
}] };
var al = { [az]: [{
	[aA]: true,
	[G]: s$1,
	[aB]: B,
	[aC]: "{bucketArn#region}"
}] };
var am = { [az]: [{
	[aA]: true,
	[G]: s$1,
	[aB]: H,
	[aC]: "{bucketArn#region}"
}] };
var an = { [az]: [{
	[aA]: true,
	[G]: P,
	[aB]: C,
	[aD]: ["*"]
}, {
	[aA]: true,
	[G]: s$1,
	[aB]: C,
	[aC]: "{bucketArn#region}"
}] };
var ao = { [az]: [{
	[aA]: true,
	[G]: s$1,
	[aB]: B,
	[aC]: "{Region}"
}] };
var ap = [Y];
var aq = [{ [aw]: "Endpoint" }];
var as = [V];
var at = [
	V,
	0,
	7,
	true
];
var au = [Z, "resourceId[1]"];
var av = ["*"];
var _data$4 = {
	conditions: [
		[d$4, ap],
		[e$4, [{ [aw]: "Accelerate" }, b$4]],
		[e$4, [T, b$4]],
		[e$4, [U, b$4]],
		[d$4, aq],
		[d$4, as],
		[f$4, [{
			fn: g$4,
			[ax]: [{
				fn: h$4,
				[ax]: [
					V,
					0,
					6,
					b$4
				]
			}, i$4]
		}, "--x-s3"]],
		[f$4, [{
			fn: g$4,
			[ax]: [{
				fn: h$4,
				[ax]: at
			}, i$4]
		}, "--xa-s3"]],
		[
			j$4,
			ap,
			k$4
		],
		[
			h$4,
			at,
			l$2
		],
		[f$4, [{ [aw]: l$2 }, "--op-s3"]],
		[
			h$4,
			[
				V,
				8,
				12,
				b$4
			],
			m$2
		],
		[
			h$4,
			[
				V,
				32,
				49,
				b$4
			],
			n$2(2)
		],
		[
			h$4,
			[
				V,
				49,
				50,
				b$4
			],
			o$2
		],
		[e$4, [{ [aw]: "ForcePathStyle" }, b$4]],
		[f$4, [W, "aws-cn"]],
		[
			p$2,
			[
				U,
				".dualstack",
				i$4
			],
			"_s3e_ds"
		],
		[q$2, [{ [aw]: n$2(2) }, c$4]],
		[
			p$2,
			[
				T,
				"-fips",
				i$4
			],
			"_s3e_fips"
		],
		[
			p$2,
			[
				{
					fn: g$4,
					[ax]: [{ [aw]: "DisableS3ExpressSessionAuth" }, c$4]
				},
				s$1,
				"sigv4-s3express"
			],
			"_s3e_auth"
		],
		[t, [V, c$4]],
		[
			"parseURL",
			aq,
			u
		],
		[e$4, [{
			fn: g$4,
			[ax]: [{ [aw]: "UseS3ExpressControlEndpoint" }, c$4]
		}, b$4]],
		[t, [V, b$4]],
		[f$4, [{
			fn: v,
			[ax]: [X, "scheme"]
		}, "http"]],
		[q$2, [Y, c$4]],
		[
			"aws.parseArn",
			as,
			w
		],
		[
			v,
			[{
				fn: "split",
				[ax]: [
					V,
					x,
					0
				]
			}, "[-2]"],
			"s3expressAvailabilityZoneId"
		],
		[f$4, [{
			fn: g$4,
			[ax]: [{
				fn: h$4,
				[ax]: [
					V,
					0,
					4,
					c$4
				]
			}, i$4]
		}, "arn:"]],
		[f$4, [{
			fn: g$4,
			[ax]: [{
				fn: h$4,
				[ax]: [
					V,
					16,
					18,
					b$4
				]
			}, i$4]
		}, x]],
		[e$4, [{
			fn: v,
			[ax]: [X, "isIp"]
		}, b$4]],
		[f$4, [{
			fn: g$4,
			[ax]: [{
				fn: h$4,
				[ax]: [
					V,
					21,
					23,
					b$4
				]
			}, i$4]
		}, x]],
		[f$4, [{
			fn: g$4,
			[ax]: [{
				fn: h$4,
				[ax]: [
					V,
					27,
					29,
					b$4
				]
			}, i$4]
		}, x]],
		[f$4, [{ [aw]: m$2 }, "beta"]],
		[
			"uriEncode",
			as,
			"uri_encoded_bucket"
		],
		[q$2, [Y, b$4]],
		[e$4, [{
			fn: g$4,
			[ax]: [{ [aw]: "UseObjectLambdaEndpoint" }, c$4]
		}, b$4]],
		[
			v,
			[Z, "resourceId[0]"],
			y
		],
		[f$4, [aa, i$4]],
		[f$4, [aa, z]],
		[
			v,
			au,
			A(1)
		],
		[f$4, [ab, i$4]],
		[f$4, [ac, i$4]],
		[f$4, [{
			fn: g$4,
			[ax]: [{
				fn: h$4,
				[ax]: [
					V,
					14,
					16,
					b$4
				]
			}, i$4]
		}, x]],
		[f$4, [ad, "e"]],
		[f$4, [ad, "o"]],
		[f$4, [Y, "aws-global"]],
		[f$4, [{
			fn: g$4,
			[ax]: [{
				fn: h$4,
				[ax]: [
					V,
					19,
					21,
					b$4
				]
			}, i$4]
		}, x]],
		[f$4, [ae, B]],
		[e$4, [{
			fn: g$4,
			[ax]: [{ [aw]: "DisableAccessPoints" }, c$4]
		}, b$4]],
		[f$4, [ae, C]],
		[
			j$4,
			[ac],
			D
		],
		[q$2, [ab, b$4]],
		[f$4, [{
			fn: g$4,
			[ax]: [{
				fn: h$4,
				[ax]: [
					V,
					26,
					28,
					b$4
				]
			}, i$4]
		}, x]],
		[f$4, [{
			fn: g$4,
			[ax]: [{
				fn: h$4,
				[ax]: [
					V,
					15,
					17,
					b$4
				]
			}, i$4]
		}, x]],
		[v, [Z, "resourceId[4]"]],
		[f$4, [{
			fn: g$4,
			[ax]: [{
				fn: h$4,
				[ax]: [
					V,
					20,
					22,
					b$4
				]
			}, i$4]
		}, x]],
		[e$4, [{ [aw]: "UseGlobalEndpoint" }, b$4]],
		[f$4, [Y, E]],
		[
			v,
			au,
			n$2(1)
		],
		[e$4, [{
			fn: g$4,
			[ax]: [{ [aw]: "UseArnRegion" }, b$4]
		}, b$4]],
		[q$2, [{ [aw]: n$2(1) }, c$4]],
		[
			v,
			[Z, "resourceId[2]"],
			F
		],
		[f$4, [Y, ac]],
		[f$4, [{
			fn: v,
			[ax]: [{ [aw]: D }, G]
		}, W]],
		[e$4, [{ [aw]: "DisableMultiRegionAccessPoints" }, b$4]],
		[q$2, [ac, b$4]],
		[f$4, [{
			fn: v,
			[ax]: [Z, "partition"]
		}, W]],
		[f$4, [af, i$4]],
		[f$4, [ae, H]],
		[q$2, [af, c$4]],
		[
			v,
			[Z, "resourceId[3]"],
			A(2)
		],
		[q$2, [ab, c$4]],
		[f$4, [{ [aw]: F }, z]],
		[q$2, [{ [aw]: A(2) }, c$4]]
	],
	results: [
		[a$4],
		[a$4, "Accelerate cannot be used with FIPS"],
		[a$4, "Cannot set dual-stack in combination with a custom endpoint."],
		[a$4, "A custom endpoint cannot be combined with FIPS"],
		[a$4, "A custom endpoint cannot be combined with S3 Accelerate"],
		[a$4, "Partition does not support FIPS"],
		[a$4, "S3Express does not support S3 Accelerate."],
		["{url#scheme}://{url#authority}/{uri_encoded_bucket}{url#path}", ag],
		[I, ag],
		[a$4, "S3Express bucket name is not a valid virtual hostable name."],
		["https://s3express-control{_s3e_fips}{_s3e_ds}.{Region}.{partitionResult#dnsSuffix}/{uri_encoded_bucket}", ah],
		["https://{Bucket}.s3express{_s3e_fips}-{s3expressAvailabilityZoneId}{_s3e_ds}.{Region}.{partitionResult#dnsSuffix}", ag],
		[a$4, "Unrecognized S3Express bucket name format."],
		[J, ag],
		["https://s3express-control{_s3e_fips}{_s3e_ds}.{Region}.{partitionResult#dnsSuffix}", ah],
		[a$4, "Expected a endpoint to be specified but no endpoint was found"],
		["https://{Bucket}.ec2.{url#authority}", ai],
		["https://{Bucket}.ec2.s3-outposts.{Region}.{partitionResult#dnsSuffix}", ai],
		["https://{Bucket}.op-{outpostId_ssa_2}.{url#authority}", ai],
		["https://{Bucket}.op-{outpostId_ssa_2}.s3-outposts.{Region}.{partitionResult#dnsSuffix}", ai],
		[a$4, "Unrecognized hardware type: \"Expected hardware type o or e but got {hardwareType}\""],
		[a$4, "Invalid Outposts Bucket alias - it must be a valid bucket name."],
		[a$4, "Invalid ARN: The outpost Id must only contain a-z, A-Z, 0-9 and `-`."],
		[a$4, "Custom endpoint `{Endpoint}` was not a valid URI"],
		[a$4, "S3 Accelerate cannot be used in this region"],
		["https://{Bucket}.s3-fips.dualstack.us-east-1.{partitionResult#dnsSuffix}", aj],
		["https://{Bucket}.s3-fips.dualstack.{Region}.{partitionResult#dnsSuffix}", ak],
		["https://{Bucket}.s3-fips.us-east-1.{partitionResult#dnsSuffix}", aj],
		["https://{Bucket}.s3-fips.{Region}.{partitionResult#dnsSuffix}", ak],
		["https://{Bucket}.s3-accelerate.dualstack.us-east-1.{partitionResult#dnsSuffix}", aj],
		["https://{Bucket}.s3-accelerate.dualstack.{partitionResult#dnsSuffix}", ak],
		["https://{Bucket}.s3.dualstack.us-east-1.{partitionResult#dnsSuffix}", aj],
		["https://{Bucket}.s3.dualstack.{Region}.{partitionResult#dnsSuffix}", ak],
		[K$1, aj],
		[I, aj],
		[K$1, ak],
		[I, ak],
		[L, aj],
		[L, ak],
		[M, aj],
		[M, ak],
		["https://{Bucket}.s3.{Region}.{partitionResult#dnsSuffix}", ak],
		[a$4, "Invalid region: region was not a valid DNS name."],
		[a$4, "S3 Object Lambda does not support Dual-stack"],
		[a$4, "S3 Object Lambda does not support S3 Accelerate"],
		[a$4, "Access points are not supported for this operation"],
		[a$4, "Invalid configuration: region from ARN `{bucketArn#region}` does not match client region `{Region}` and UseArnRegion is `false`"],
		[a$4, "Invalid ARN: Missing account id"],
		[N(1), al],
		["https://{accessPointName_ssa_1}-{bucketArn#accountId}.s3-object-lambda-fips.{bucketArn#region}.{bucketPartition#dnsSuffix}", al],
		["https://{accessPointName_ssa_1}-{bucketArn#accountId}.s3-object-lambda.{bucketArn#region}.{bucketPartition#dnsSuffix}", al],
		[a$4, O(1)],
		[a$4, "Invalid ARN: The account id may only contain a-z, A-Z, 0-9 and `-`. Found: `{bucketArn#accountId}`"],
		[a$4, "Invalid region in ARN: `{bucketArn#region}` (invalid DNS name)"],
		[a$4, "Client was configured for partition `{partitionResult#name}` but ARN (`{Bucket}`) has `{bucketPartition#name}`"],
		[a$4, "Invalid ARN: The ARN may only contain a single resource component after `accesspoint`."],
		[a$4, "Invalid ARN: bucket ARN is missing a region"],
		[a$4, "Invalid ARN: Expected a resource of the format `accesspoint:<accesspoint name>` but no name was provided"],
		[a$4, "Invalid ARN: Object Lambda ARNs only support `accesspoint` arn types, but found: `{arnType}`"],
		[a$4, "Access Points do not support S3 Accelerate"],
		["https://{accessPointName_ssa_1}-{bucketArn#accountId}.s3-accesspoint-fips.dualstack.{bucketArn#region}.{bucketPartition#dnsSuffix}", am],
		["https://{accessPointName_ssa_1}-{bucketArn#accountId}.s3-accesspoint-fips.{bucketArn#region}.{bucketPartition#dnsSuffix}", am],
		["https://{accessPointName_ssa_1}-{bucketArn#accountId}.s3-accesspoint.dualstack.{bucketArn#region}.{bucketPartition#dnsSuffix}", am],
		[N(1), am],
		["https://{accessPointName_ssa_1}-{bucketArn#accountId}.s3-accesspoint.{bucketArn#region}.{bucketPartition#dnsSuffix}", am],
		[a$4, "Invalid ARN: The ARN was not for the S3 service, found: {bucketArn#service}"],
		[a$4, "S3 MRAP does not support dual-stack"],
		[a$4, "S3 MRAP does not support FIPS"],
		[a$4, "S3 MRAP does not support S3 Accelerate"],
		[a$4, "Invalid configuration: Multi-Region Access Point ARNs are disabled."],
		["https://{accessPointName_ssa_1}.accesspoint.s3-global.{partitionResult#dnsSuffix}", { [az]: [{
			[aA]: b$4,
			name: P,
			[aB]: H,
			[aD]: av
		}] }],
		[a$4, "Client was configured for partition `{partitionResult#name}` but bucket referred to partition `{bucketArn#partition}`"],
		[a$4, "Invalid Access Point Name"],
		[a$4, "S3 Outposts does not support Dual-stack"],
		[a$4, "S3 Outposts does not support FIPS"],
		[a$4, "S3 Outposts does not support S3 Accelerate"],
		[a$4, "Invalid Arn: Outpost Access Point ARN contains sub resources"],
		["https://{accessPointName_ssa_2}-{bucketArn#accountId}.{outpostId_ssa_1}.{url#authority}", an],
		["https://{accessPointName_ssa_2}-{bucketArn#accountId}.{outpostId_ssa_1}.s3-outposts.{bucketArn#region}.{bucketPartition#dnsSuffix}", an],
		[a$4, O(2)],
		[a$4, "Expected an outpost type `accesspoint`, found {outpostType}"],
		[a$4, "Invalid ARN: expected an access point name"],
		[a$4, "Invalid ARN: Expected a 4-component resource"],
		[a$4, "Invalid ARN: The outpost Id may only contain a-z, A-Z, 0-9 and `-`. Found: `{outpostId_ssa_1}`"],
		[a$4, "Invalid ARN: The Outpost Id was not set"],
		[a$4, "Invalid ARN: Unrecognized format: {Bucket} (type: {arnType})"],
		[a$4, "Invalid ARN: No ARN type specified"],
		[a$4, "Invalid ARN: `{Bucket}` was not a valid ARN"],
		[a$4, "Path-style addressing cannot be used with ARN buckets"],
		["https://s3-fips.dualstack.us-east-1.{partitionResult#dnsSuffix}/{uri_encoded_bucket}", aj],
		["https://s3-fips.dualstack.{Region}.{partitionResult#dnsSuffix}/{uri_encoded_bucket}", ak],
		["https://s3-fips.us-east-1.{partitionResult#dnsSuffix}/{uri_encoded_bucket}", aj],
		["https://s3-fips.{Region}.{partitionResult#dnsSuffix}/{uri_encoded_bucket}", ak],
		["https://s3.dualstack.us-east-1.{partitionResult#dnsSuffix}/{uri_encoded_bucket}", aj],
		["https://s3.dualstack.{Region}.{partitionResult#dnsSuffix}/{uri_encoded_bucket}", ak],
		[Q, aj],
		[Q, ak],
		[R, aj],
		[R, ak],
		["https://s3.{Region}.{partitionResult#dnsSuffix}/{uri_encoded_bucket}", ak],
		[a$4, "Path-style addressing cannot be used with S3 Accelerate"],
		[J, ao],
		["https://s3-object-lambda-fips.{Region}.{partitionResult#dnsSuffix}", ao],
		["https://s3-object-lambda.{Region}.{partitionResult#dnsSuffix}", ao],
		["https://s3-fips.dualstack.us-east-1.{partitionResult#dnsSuffix}", aj],
		["https://s3-fips.dualstack.{Region}.{partitionResult#dnsSuffix}", ak],
		["https://s3-fips.us-east-1.{partitionResult#dnsSuffix}", aj],
		["https://s3-fips.{Region}.{partitionResult#dnsSuffix}", ak],
		["https://s3.dualstack.us-east-1.{partitionResult#dnsSuffix}", aj],
		["https://s3.dualstack.{Region}.{partitionResult#dnsSuffix}", ak],
		[J, aj],
		[J, ak],
		[S, aj],
		[S, ak],
		["https://s3.{Region}.{partitionResult#dnsSuffix}", ak],
		[a$4, "A region must be set when sending requests to S3."]
	]
};
var root$4 = 2;
var nodes$4 = new Int32Array([
	-1,
	1,
	-1,
	0,
	3,
	100000115,
	1,
	424,
	4,
	2,
	272,
	5,
	3,
	233,
	6,
	4,
	85,
	7,
	5,
	15,
	8,
	8,
	9,
	100000115,
	16,
	10,
	13,
	18,
	11,
	13,
	19,
	12,
	13,
	22,
	100000014,
	13,
	35,
	14,
	100000042,
	36,
	100000103,
	435,
	6,
	271,
	16,
	7,
	270,
	17,
	8,
	19,
	18,
	14,
	501,
	106,
	9,
	20,
	24,
	10,
	21,
	24,
	11,
	22,
	24,
	12,
	23,
	24,
	13,
	547,
	24,
	14,
	77,
	25,
	20,
	73,
	26,
	26,
	27,
	78,
	37,
	28,
	100000086,
	38,
	100000086,
	29,
	39,
	47,
	30,
	48,
	100000058,
	31,
	50,
	32,
	100000085,
	51,
	33,
	136,
	55,
	100000076,
	34,
	59,
	35,
	100000084,
	60,
	39,
	36,
	61,
	37,
	100000083,
	62,
	38,
	146,
	63,
	41,
	100000046,
	61,
	40,
	100000083,
	62,
	41,
	150,
	64,
	42,
	100000054,
	66,
	43,
	100000053,
	70,
	44,
	100000052,
	71,
	45,
	100000081,
	73,
	46,
	100000080,
	74,
	100000078,
	100000079,
	40,
	48,
	100000057,
	41,
	100000057,
	49,
	42,
	185,
	50,
	48,
	62,
	51,
	49,
	100000045,
	52,
	51,
	53,
	526,
	60,
	56,
	54,
	62,
	100000055,
	55,
	63,
	57,
	100000046,
	62,
	100000055,
	57,
	64,
	58,
	100000054,
	66,
	59,
	100000053,
	69,
	60,
	100000065,
	70,
	61,
	100000052,
	72,
	100000064,
	100000051,
	49,
	100000045,
	63,
	51,
	64,
	526,
	60,
	67,
	65,
	62,
	100000055,
	66,
	63,
	68,
	100000046,
	62,
	100000055,
	68,
	64,
	69,
	100000054,
	66,
	70,
	100000053,
	68,
	100000047,
	71,
	70,
	72,
	100000052,
	72,
	100000050,
	100000051,
	25,
	74,
	100000042,
	46,
	100000039,
	75,
	57,
	76,
	100000041,
	58,
	100000040,
	100000041,
	26,
	100000088,
	78,
	28,
	100000087,
	79,
	34,
	82,
	80,
	35,
	81,
	545,
	36,
	100000103,
	100000115,
	46,
	100000097,
	83,
	57,
	84,
	100000099,
	58,
	100000098,
	100000099,
	5,
	101,
	86,
	8,
	87,
	100000115,
	16,
	88,
	89,
	18,
	91,
	89,
	19,
	90,
	92,
	21,
	97,
	95,
	19,
	93,
	92,
	21,
	98,
	95,
	21,
	97,
	94,
	22,
	100000014,
	95,
	35,
	96,
	100000042,
	36,
	100000103,
	100000042,
	22,
	100000013,
	98,
	35,
	99,
	100000042,
	36,
	100000101,
	100,
	46,
	100000110,
	100000111,
	6,
	214,
	102,
	7,
	208,
	103,
	8,
	119,
	104,
	14,
	118,
	105,
	21,
	106,
	100000023,
	26,
	107,
	502,
	37,
	108,
	100000086,
	38,
	100000086,
	109,
	39,
	112,
	110,
	48,
	100000058,
	111,
	50,
	136,
	100000085,
	40,
	113,
	100000057,
	41,
	100000057,
	114,
	42,
	115,
	500,
	48,
	100000056,
	116,
	52,
	117,
	100000072,
	65,
	100000069,
	100000072,
	21,
	501,
	100000023,
	9,
	120,
	124,
	10,
	121,
	124,
	11,
	122,
	124,
	12,
	123,
	124,
	13,
	202,
	124,
	14,
	195,
	125,
	20,
	190,
	126,
	21,
	127,
	100000023,
	23,
	128,
	129,
	24,
	189,
	129,
	26,
	130,
	197,
	37,
	131,
	100000086,
	38,
	100000086,
	132,
	39,
	159,
	133,
	48,
	100000058,
	134,
	50,
	135,
	100000085,
	51,
	141,
	136,
	55,
	100000076,
	137,
	59,
	138,
	100000084,
	60,
	100000083,
	139,
	61,
	140,
	100000083,
	63,
	100000083,
	100000046,
	55,
	100000076,
	142,
	59,
	143,
	100000084,
	60,
	148,
	144,
	61,
	145,
	100000083,
	62,
	147,
	146,
	63,
	150,
	100000046,
	63,
	153,
	100000046,
	61,
	149,
	100000083,
	62,
	153,
	150,
	64,
	151,
	100000054,
	66,
	152,
	100000053,
	70,
	100000082,
	100000052,
	64,
	154,
	100000054,
	66,
	155,
	100000053,
	70,
	156,
	100000052,
	71,
	157,
	100000081,
	73,
	158,
	100000080,
	74,
	100000077,
	100000079,
	40,
	160,
	100000057,
	41,
	100000057,
	161,
	42,
	185,
	162,
	48,
	174,
	163,
	49,
	100000045,
	164,
	51,
	165,
	526,
	60,
	168,
	166,
	62,
	100000055,
	167,
	63,
	169,
	100000046,
	62,
	100000055,
	169,
	64,
	170,
	100000054,
	66,
	171,
	100000053,
	69,
	172,
	100000065,
	70,
	173,
	100000052,
	72,
	100000063,
	100000051,
	49,
	100000045,
	175,
	51,
	176,
	526,
	60,
	179,
	177,
	62,
	100000055,
	178,
	63,
	180,
	100000046,
	62,
	100000055,
	180,
	64,
	181,
	100000054,
	66,
	182,
	100000053,
	68,
	100000047,
	183,
	70,
	184,
	100000052,
	72,
	100000048,
	100000051,
	48,
	100000056,
	186,
	52,
	187,
	100000072,
	65,
	100000069,
	188,
	67,
	100000070,
	100000071,
	25,
	100000036,
	100000042,
	21,
	191,
	100000023,
	25,
	192,
	100000042,
	30,
	194,
	193,
	46,
	100000034,
	100000036,
	46,
	100000033,
	100000035,
	21,
	196,
	100000023,
	26,
	100000088,
	197,
	28,
	100000087,
	198,
	34,
	201,
	199,
	35,
	200,
	545,
	36,
	100000101,
	100000115,
	46,
	100000095,
	100000096,
	17,
	203,
	100000022,
	20,
	204,
	100000021,
	21,
	205,
	550,
	33,
	206,
	550,
	44,
	100000016,
	207,
	45,
	100000018,
	100000020,
	8,
	209,
	215,
	16,
	210,
	220,
	18,
	211,
	220,
	19,
	212,
	224,
	20,
	213,
	227,
	21,
	231,
	401,
	8,
	218,
	215,
	19,
	216,
	100000009,
	20,
	217,
	227,
	21,
	231,
	100000009,
	16,
	219,
	220,
	18,
	223,
	220,
	19,
	221,
	224,
	20,
	222,
	227,
	21,
	231,
	100000012,
	19,
	226,
	224,
	20,
	225,
	100000009,
	21,
	100000009,
	100000012,
	20,
	230,
	227,
	21,
	228,
	100000009,
	30,
	229,
	100000009,
	34,
	100000007,
	100000009,
	21,
	231,
	415,
	30,
	232,
	100000008,
	34,
	100000007,
	100000008,
	4,
	100000002,
	234,
	5,
	235,
	480,
	6,
	271,
	236,
	7,
	270,
	237,
	8,
	238,
	491,
	9,
	239,
	243,
	10,
	240,
	243,
	11,
	241,
	243,
	12,
	242,
	243,
	13,
	547,
	243,
	14,
	266,
	244,
	20,
	264,
	245,
	26,
	246,
	267,
	37,
	247,
	100000086,
	38,
	100000086,
	248,
	39,
	249,
	518,
	40,
	250,
	100000057,
	41,
	100000057,
	251,
	42,
	538,
	252,
	48,
	100000043,
	253,
	49,
	100000045,
	254,
	51,
	255,
	526,
	60,
	258,
	256,
	62,
	100000055,
	257,
	63,
	259,
	100000046,
	62,
	100000055,
	259,
	64,
	260,
	100000054,
	66,
	261,
	100000053,
	69,
	262,
	100000065,
	70,
	263,
	100000052,
	72,
	100000062,
	100000051,
	25,
	265,
	100000042,
	46,
	100000031,
	100000032,
	26,
	100000088,
	267,
	28,
	100000087,
	268,
	34,
	269,
	544,
	46,
	100000093,
	100000094,
	8,
	397,
	100000009,
	8,
	407,
	100000009,
	3,
	346,
	273,
	4,
	100000003,
	274,
	5,
	284,
	275,
	8,
	276,
	100000115,
	15,
	100000005,
	277,
	16,
	278,
	281,
	18,
	279,
	281,
	19,
	280,
	281,
	22,
	100000014,
	281,
	35,
	282,
	100000042,
	36,
	100000102,
	283,
	46,
	100000106,
	100000107,
	6,
	405,
	285,
	7,
	395,
	286,
	8,
	295,
	287,
	14,
	501,
	288,
	26,
	289,
	502,
	37,
	290,
	100000086,
	38,
	100000086,
	291,
	39,
	292,
	307,
	40,
	293,
	100000057,
	41,
	100000057,
	294,
	42,
	335,
	500,
	9,
	296,
	300,
	10,
	297,
	300,
	11,
	298,
	300,
	12,
	299,
	300,
	13,
	394,
	300,
	14,
	339,
	301,
	15,
	100000005,
	302,
	20,
	337,
	303,
	26,
	304,
	341,
	37,
	305,
	100000086,
	38,
	100000086,
	306,
	39,
	309,
	307,
	48,
	100000058,
	308,
	50,
	100000074,
	100000085,
	40,
	310,
	100000057,
	41,
	100000057,
	311,
	42,
	335,
	312,
	48,
	324,
	313,
	49,
	100000045,
	314,
	51,
	315,
	526,
	60,
	318,
	316,
	62,
	100000055,
	317,
	63,
	319,
	100000046,
	62,
	100000055,
	319,
	64,
	320,
	100000054,
	66,
	321,
	100000053,
	69,
	322,
	100000065,
	70,
	323,
	100000052,
	72,
	100000061,
	100000051,
	49,
	100000045,
	325,
	51,
	326,
	526,
	60,
	329,
	327,
	62,
	100000055,
	328,
	63,
	330,
	100000046,
	62,
	100000055,
	330,
	64,
	331,
	100000054,
	66,
	332,
	100000053,
	68,
	100000047,
	333,
	70,
	334,
	100000052,
	72,
	100000049,
	100000051,
	48,
	100000056,
	336,
	52,
	100000067,
	100000072,
	25,
	338,
	100000042,
	46,
	100000027,
	100000028,
	15,
	100000005,
	340,
	26,
	100000088,
	341,
	28,
	100000087,
	342,
	34,
	345,
	343,
	35,
	344,
	545,
	36,
	100000102,
	100000115,
	46,
	100000091,
	100000092,
	4,
	100000002,
	347,
	5,
	357,
	348,
	8,
	349,
	100000115,
	15,
	100000005,
	350,
	16,
	351,
	354,
	18,
	352,
	354,
	19,
	353,
	354,
	22,
	100000014,
	354,
	35,
	355,
	100000042,
	36,
	100000043,
	356,
	46,
	100000104,
	100000105,
	6,
	405,
	358,
	7,
	395,
	359,
	8,
	360,
	491,
	9,
	361,
	365,
	10,
	362,
	365,
	11,
	363,
	365,
	12,
	364,
	365,
	13,
	394,
	365,
	14,
	389,
	366,
	15,
	100000005,
	367,
	20,
	387,
	368,
	26,
	369,
	391,
	37,
	370,
	100000086,
	38,
	100000086,
	371,
	39,
	372,
	518,
	40,
	373,
	100000057,
	41,
	100000057,
	374,
	42,
	538,
	375,
	48,
	100000043,
	376,
	49,
	100000045,
	377,
	51,
	378,
	526,
	60,
	381,
	379,
	62,
	100000055,
	380,
	63,
	382,
	100000046,
	62,
	100000055,
	382,
	64,
	383,
	100000054,
	66,
	384,
	100000053,
	69,
	385,
	100000065,
	70,
	386,
	100000052,
	72,
	100000060,
	100000051,
	25,
	388,
	100000042,
	46,
	100000025,
	100000026,
	15,
	100000005,
	390,
	26,
	100000088,
	391,
	28,
	100000087,
	392,
	34,
	393,
	544,
	46,
	100000089,
	100000090,
	15,
	100000005,
	547,
	8,
	396,
	100000009,
	15,
	100000005,
	397,
	16,
	398,
	410,
	18,
	399,
	410,
	19,
	400,
	410,
	20,
	401,
	100000009,
	27,
	402,
	100000012,
	29,
	100000011,
	403,
	31,
	100000011,
	404,
	32,
	100000011,
	422,
	8,
	406,
	100000009,
	15,
	100000005,
	407,
	16,
	408,
	410,
	18,
	409,
	410,
	19,
	411,
	410,
	20,
	100000012,
	100000009,
	20,
	414,
	412,
	22,
	413,
	100000009,
	34,
	100000010,
	100000009,
	22,
	416,
	415,
	27,
	419,
	100000012,
	27,
	418,
	417,
	34,
	100000010,
	100000012,
	34,
	100000010,
	419,
	43,
	100000011,
	420,
	47,
	100000011,
	421,
	53,
	100000011,
	422,
	54,
	100000011,
	423,
	56,
	100000011,
	100000012,
	2,
	100000001,
	425,
	3,
	478,
	426,
	4,
	100000004,
	427,
	5,
	438,
	428,
	8,
	429,
	100000115,
	16,
	430,
	433,
	18,
	431,
	433,
	19,
	432,
	433,
	22,
	100000014,
	433,
	35,
	434,
	100000042,
	36,
	100000044,
	435,
	46,
	100000112,
	436,
	57,
	437,
	100000114,
	58,
	100000113,
	100000114,
	6,
	100000006,
	439,
	7,
	100000006,
	440,
	8,
	450,
	441,
	14,
	501,
	442,
	26,
	443,
	502,
	37,
	444,
	100000086,
	38,
	100000086,
	445,
	39,
	446,
	465,
	40,
	447,
	100000057,
	41,
	100000057,
	448,
	42,
	471,
	449,
	48,
	100000044,
	500,
	9,
	451,
	455,
	10,
	452,
	455,
	11,
	453,
	455,
	12,
	454,
	455,
	13,
	547,
	455,
	14,
	473,
	456,
	15,
	460,
	457,
	20,
	458,
	461,
	25,
	459,
	100000042,
	46,
	100000037,
	100000038,
	20,
	540,
	461,
	26,
	462,
	474,
	37,
	463,
	100000086,
	38,
	100000086,
	464,
	39,
	467,
	465,
	48,
	100000058,
	466,
	50,
	100000075,
	100000085,
	40,
	468,
	100000057,
	41,
	100000057,
	469,
	42,
	471,
	470,
	48,
	100000044,
	524,
	48,
	100000044,
	472,
	52,
	100000068,
	100000072,
	26,
	100000088,
	474,
	28,
	100000087,
	475,
	34,
	100000100,
	476,
	35,
	477,
	545,
	36,
	100000044,
	100000115,
	4,
	100000002,
	479,
	5,
	488,
	480,
	8,
	481,
	100000115,
	16,
	482,
	485,
	18,
	483,
	485,
	19,
	484,
	485,
	22,
	100000014,
	485,
	35,
	486,
	100000042,
	36,
	100000043,
	487,
	46,
	100000108,
	100000109,
	6,
	100000006,
	489,
	7,
	100000006,
	490,
	8,
	503,
	491,
	14,
	501,
	492,
	26,
	493,
	502,
	37,
	494,
	100000086,
	38,
	100000086,
	495,
	39,
	496,
	518,
	40,
	497,
	100000057,
	41,
	100000057,
	498,
	42,
	538,
	499,
	48,
	100000043,
	500,
	49,
	100000045,
	526,
	26,
	100000088,
	502,
	28,
	100000087,
	100000115,
	9,
	504,
	508,
	10,
	505,
	508,
	11,
	506,
	508,
	12,
	507,
	508,
	13,
	547,
	508,
	14,
	541,
	509,
	15,
	513,
	510,
	20,
	511,
	514,
	25,
	512,
	100000042,
	46,
	100000029,
	100000030,
	20,
	540,
	514,
	26,
	515,
	542,
	37,
	516,
	100000086,
	38,
	100000086,
	517,
	39,
	520,
	518,
	48,
	100000058,
	519,
	50,
	100000073,
	100000085,
	40,
	521,
	100000057,
	41,
	100000057,
	522,
	42,
	538,
	523,
	48,
	100000043,
	524,
	49,
	100000045,
	525,
	51,
	529,
	526,
	60,
	100000055,
	527,
	62,
	100000055,
	528,
	63,
	100000055,
	100000046,
	60,
	532,
	530,
	62,
	100000055,
	531,
	63,
	533,
	100000046,
	62,
	100000055,
	533,
	64,
	534,
	100000054,
	66,
	535,
	100000053,
	69,
	536,
	100000065,
	70,
	537,
	100000052,
	72,
	100000059,
	100000051,
	48,
	100000043,
	539,
	52,
	100000066,
	100000072,
	25,
	100000024,
	100000042,
	26,
	100000088,
	542,
	28,
	100000087,
	543,
	34,
	100000100,
	544,
	35,
	546,
	545,
	36,
	100000042,
	100000115,
	36,
	100000043,
	100000115,
	17,
	548,
	100000022,
	20,
	549,
	100000021,
	33,
	552,
	550,
	44,
	100000017,
	551,
	45,
	100000019,
	100000020,
	44,
	100000015,
	553,
	45,
	100000015,
	100000020
]);
var bdd$4 = BinaryDecisionDiagram.from(nodes$4, root$4, _data$4.conditions, _data$4.results);
//#endregion
//#region ../../node_modules/@aws-sdk/client-s3/dist-es/endpoint/endpointResolver.js
init_client();
init_endpoints();
var cache$4 = new EndpointCache({
	size: 50,
	params: [
		"Accelerate",
		"Bucket",
		"DisableAccessPoints",
		"DisableMultiRegionAccessPoints",
		"DisableS3ExpressSessionAuth",
		"Endpoint",
		"ForcePathStyle",
		"Region",
		"UseArnRegion",
		"UseDualStack",
		"UseFIPS",
		"UseGlobalEndpoint",
		"UseObjectLambdaEndpoint",
		"UseS3ExpressControlEndpoint"
	]
});
var defaultEndpointResolver$4 = (endpointParams, context = {}) => {
	return cache$4.get(endpointParams, () => decideEndpoint(bdd$4, {
		endpointParams,
		logger: context.logger
	}));
};
customEndpointFunctions.aws = awsEndpointFunctions;
//#endregion
//#region ../../node_modules/@aws-sdk/client-s3/dist-es/auth/httpAuthSchemeProvider.js
init_httpAuthSchemes();
init_dist_es$11();
init_client$1();
init_endpoints();
var createEndpointRuleSetHttpAuthSchemeParametersProvider$1 = (defaultHttpAuthSchemeParametersProvider) => async (config, context, input) => {
	if (!input) throw new Error("Could not find `input` for `defaultEndpointRuleSetHttpAuthSchemeParametersProvider`");
	const defaultParameters = await defaultHttpAuthSchemeParametersProvider(config, context, input);
	const instructionsFn = getSmithyContext(context)?.commandInstance?.constructor?.getEndpointParameterInstructions;
	if (!instructionsFn) throw new Error(`getEndpointParameterInstructions() is not defined on '${context.commandName}'`);
	const endpointParameters = await resolveParams(input, { getEndpointParameterInstructions: instructionsFn }, config);
	return Object.assign(defaultParameters, endpointParameters);
};
var _defaultS3HttpAuthSchemeParametersProvider = async (config, context, input) => {
	return {
		operation: getSmithyContext(context).operation,
		region: await normalizeProvider$1(config.region)() || (() => {
			throw new Error("expected `region` to be configured for `aws.auth#sigv4`");
		})()
	};
};
var defaultS3HttpAuthSchemeParametersProvider = createEndpointRuleSetHttpAuthSchemeParametersProvider$1(_defaultS3HttpAuthSchemeParametersProvider);
function createAwsAuthSigv4HttpAuthOption$4(authParameters) {
	return {
		schemeId: "aws.auth#sigv4",
		signingProperties: {
			name: "s3",
			region: authParameters.region
		},
		propertiesExtractor: (config, context) => ({ signingProperties: {
			config,
			context
		} })
	};
}
function createAwsAuthSigv4aHttpAuthOption$1(authParameters) {
	return {
		schemeId: "aws.auth#sigv4a",
		signingProperties: {
			name: "s3",
			region: authParameters.region
		},
		propertiesExtractor: (config, context) => ({ signingProperties: {
			config,
			context
		} })
	};
}
var createEndpointRuleSetHttpAuthSchemeProvider$1 = (defaultEndpointResolver, defaultHttpAuthSchemeResolver, createHttpAuthOptionFunctions) => {
	const endpointRuleSetHttpAuthSchemeProvider = (authParameters) => {
		const authSchemes = defaultEndpointResolver(authParameters).properties?.authSchemes;
		if (!authSchemes) return defaultHttpAuthSchemeResolver(authParameters);
		const options = [];
		for (const scheme of authSchemes) {
			const { name: resolvedName, properties = {}, ...rest } = scheme;
			const name = resolvedName.toLowerCase();
			if (resolvedName !== name) console.warn(`HttpAuthScheme has been normalized with lowercasing: '${resolvedName}' to '${name}'`);
			let schemeId;
			if (name === "sigv4a") {
				schemeId = "aws.auth#sigv4a";
				const sigv4Present = authSchemes.find((s) => {
					const name = s.name.toLowerCase();
					return name !== "sigv4a" && name.startsWith("sigv4");
				});
				if (SignatureV4MultiRegion.sigv4aDependency() === "none" && sigv4Present) continue;
			} else if (name.startsWith("sigv4")) schemeId = "aws.auth#sigv4";
			else throw new Error(`Unknown HttpAuthScheme found in '@smithy.rules#endpointRuleSet': '${name}'`);
			const createOption = createHttpAuthOptionFunctions[schemeId];
			if (!createOption) throw new Error(`Could not find HttpAuthOption create function for '${schemeId}'`);
			const option = createOption(authParameters);
			option.schemeId = schemeId;
			option.signingProperties = {
				...option.signingProperties || {},
				...rest,
				...properties
			};
			options.push(option);
		}
		return options;
	};
	return endpointRuleSetHttpAuthSchemeProvider;
};
var _defaultS3HttpAuthSchemeProvider = (authParameters) => {
	const options = [];
	switch (authParameters.operation) {
		default:
			options.push(createAwsAuthSigv4HttpAuthOption$4(authParameters));
			options.push(createAwsAuthSigv4aHttpAuthOption$1(authParameters));
	}
	return options;
};
var defaultS3HttpAuthSchemeProvider = createEndpointRuleSetHttpAuthSchemeProvider$1(defaultEndpointResolver$4, _defaultS3HttpAuthSchemeProvider, {
	"aws.auth#sigv4": createAwsAuthSigv4HttpAuthOption$4,
	"aws.auth#sigv4a": createAwsAuthSigv4aHttpAuthOption$1
});
var resolveHttpAuthSchemeConfig$4 = (config) => {
	const config_0 = resolveAwsSdkSigV4Config(config);
	const config_1 = resolveAwsSdkSigV4AConfig(config_0);
	return Object.assign(config_1, { authSchemePreference: normalizeProvider$1(config.authSchemePreference ?? []) });
};
//#endregion
//#region ../../node_modules/@aws-sdk/client-s3/dist-es/endpoint/EndpointParameters.js
var resolveClientEndpointParameters$4 = (options) => {
	return Object.assign(options, {
		useFipsEndpoint: options.useFipsEndpoint ?? false,
		useDualstackEndpoint: options.useDualstackEndpoint ?? false,
		forcePathStyle: options.forcePathStyle ?? false,
		useAccelerateEndpoint: options.useAccelerateEndpoint ?? false,
		useGlobalEndpoint: options.useGlobalEndpoint ?? false,
		disableMultiregionAccessPoints: options.disableMultiregionAccessPoints ?? false,
		defaultSigningName: "s3",
		clientContextParams: options.clientContextParams ?? {}
	});
};
var commonParams$4 = {
	ForcePathStyle: {
		type: "clientContextParams",
		name: "forcePathStyle"
	},
	UseArnRegion: {
		type: "clientContextParams",
		name: "useArnRegion"
	},
	DisableMultiRegionAccessPoints: {
		type: "clientContextParams",
		name: "disableMultiregionAccessPoints"
	},
	Accelerate: {
		type: "clientContextParams",
		name: "useAccelerateEndpoint"
	},
	DisableS3ExpressSessionAuth: {
		type: "clientContextParams",
		name: "disableS3ExpressSessionAuth"
	},
	UseGlobalEndpoint: {
		type: "builtInParams",
		name: "useGlobalEndpoint"
	},
	UseFIPS: {
		type: "builtInParams",
		name: "useFipsEndpoint"
	},
	Endpoint: {
		type: "builtInParams",
		name: "endpoint"
	},
	Region: {
		type: "builtInParams",
		name: "region"
	},
	UseDualStack: {
		type: "builtInParams",
		name: "useDualstackEndpoint"
	}
};
//#endregion
//#region ../../node_modules/@aws-sdk/client-s3/dist-es/commandBuilder.js
init_client$1();
init_endpoints();
var command$4 = makeBuilder(commonParams$4, "AmazonS3", "S3Client", getEndpointPlugin);
var _ep0$4 = {
	Bucket: {
		type: "contextParams",
		name: "Bucket"
	},
	Key: {
		type: "contextParams",
		name: "Key"
	}
};
var _ep4 = {
	DisableS3ExpressSessionAuth: {
		type: "staticContextParams",
		value: true
	},
	Bucket: {
		type: "contextParams",
		name: "Bucket"
	}
};
var _ep8 = {
	Bucket: {
		type: "contextParams",
		name: "Bucket"
	},
	Prefix: {
		type: "contextParams",
		name: "Prefix"
	}
};
var _mw0$4 = (Command, cs, config, o) => [getThrow200ExceptionsPlugin(config)];
var _mw7 = (Command, cs, config, o) => [
	getFlexibleChecksumsPlugin(config, {
		requestChecksumRequired: false,
		requestValidationModeMember: "ChecksumMode",
		responseAlgorithms: [
			"CRC64NVME",
			"CRC32",
			"CRC32C",
			"SHA256",
			"SHA1",
			"SHA512",
			"MD5",
			"XXHASH64",
			"XXHASH3",
			"XXHASH128"
		]
	}),
	getSsecPlugin(config),
	getS3ExpiresMiddlewarePlugin(config)
];
var _mw11 = (Command, cs, config, o) => [
	getFlexibleChecksumsPlugin(config, {
		requestAlgorithmMember: {
			"httpHeader": "x-amz-sdk-checksum-algorithm",
			"name": "ChecksumAlgorithm"
		},
		requestChecksumRequired: false
	}),
	getCheckContentLengthHeaderPlugin(config),
	getThrow200ExceptionsPlugin(config),
	getSsecPlugin(config)
];
//#endregion
//#region ../../node_modules/@aws-sdk/client-s3/dist-es/models/S3ServiceException.js
init_client$1();
var S3ServiceException = class S3ServiceException extends ServiceException {
	constructor(options) {
		super(options);
		Object.setPrototypeOf(this, S3ServiceException.prototype);
	}
};
//#endregion
//#region ../../node_modules/@aws-sdk/client-s3/dist-es/models/errors.js
var NoSuchUpload = class NoSuchUpload extends S3ServiceException {
	name = "NoSuchUpload";
	$fault = "client";
	constructor(opts) {
		super({
			name: "NoSuchUpload",
			$fault: "client",
			...opts
		});
		Object.setPrototypeOf(this, NoSuchUpload.prototype);
	}
};
var AccessDenied = class AccessDenied extends S3ServiceException {
	name = "AccessDenied";
	$fault = "client";
	constructor(opts) {
		super({
			name: "AccessDenied",
			$fault: "client",
			...opts
		});
		Object.setPrototypeOf(this, AccessDenied.prototype);
	}
};
var ObjectNotInActiveTierError = class ObjectNotInActiveTierError extends S3ServiceException {
	name = "ObjectNotInActiveTierError";
	$fault = "client";
	constructor(opts) {
		super({
			name: "ObjectNotInActiveTierError",
			$fault: "client",
			...opts
		});
		Object.setPrototypeOf(this, ObjectNotInActiveTierError.prototype);
	}
};
var BucketAlreadyExists = class BucketAlreadyExists extends S3ServiceException {
	name = "BucketAlreadyExists";
	$fault = "client";
	constructor(opts) {
		super({
			name: "BucketAlreadyExists",
			$fault: "client",
			...opts
		});
		Object.setPrototypeOf(this, BucketAlreadyExists.prototype);
	}
};
var BucketAlreadyOwnedByYou = class BucketAlreadyOwnedByYou extends S3ServiceException {
	name = "BucketAlreadyOwnedByYou";
	$fault = "client";
	constructor(opts) {
		super({
			name: "BucketAlreadyOwnedByYou",
			$fault: "client",
			...opts
		});
		Object.setPrototypeOf(this, BucketAlreadyOwnedByYou.prototype);
	}
};
var NoSuchBucket = class NoSuchBucket extends S3ServiceException {
	name = "NoSuchBucket";
	$fault = "client";
	constructor(opts) {
		super({
			name: "NoSuchBucket",
			$fault: "client",
			...opts
		});
		Object.setPrototypeOf(this, NoSuchBucket.prototype);
	}
};
var NoSuchKey = class NoSuchKey extends S3ServiceException {
	name = "NoSuchKey";
	$fault = "client";
	constructor(opts) {
		super({
			name: "NoSuchKey",
			$fault: "client",
			...opts
		});
		Object.setPrototypeOf(this, NoSuchKey.prototype);
	}
};
var InvalidObjectState = class InvalidObjectState extends S3ServiceException {
	name = "InvalidObjectState";
	$fault = "client";
	StorageClass;
	AccessTier;
	constructor(opts) {
		super({
			name: "InvalidObjectState",
			$fault: "client",
			...opts
		});
		Object.setPrototypeOf(this, InvalidObjectState.prototype);
		this.StorageClass = opts.StorageClass;
		this.AccessTier = opts.AccessTier;
	}
};
var NoSuchAnnotation = class NoSuchAnnotation extends S3ServiceException {
	name = "NoSuchAnnotation";
	$fault = "client";
	constructor(opts) {
		super({
			name: "NoSuchAnnotation",
			$fault: "client",
			...opts
		});
		Object.setPrototypeOf(this, NoSuchAnnotation.prototype);
	}
};
var NotFound = class NotFound extends S3ServiceException {
	name = "NotFound";
	$fault = "client";
	constructor(opts) {
		super({
			name: "NotFound",
			$fault: "client",
			...opts
		});
		Object.setPrototypeOf(this, NotFound.prototype);
	}
};
var InvalidPrefix = class InvalidPrefix extends S3ServiceException {
	name = "InvalidPrefix";
	$fault = "client";
	constructor(opts) {
		super({
			name: "InvalidPrefix",
			$fault: "client",
			...opts
		});
		Object.setPrototypeOf(this, InvalidPrefix.prototype);
	}
};
var EncryptionTypeMismatch = class EncryptionTypeMismatch extends S3ServiceException {
	name = "EncryptionTypeMismatch";
	$fault = "client";
	constructor(opts) {
		super({
			name: "EncryptionTypeMismatch",
			$fault: "client",
			...opts
		});
		Object.setPrototypeOf(this, EncryptionTypeMismatch.prototype);
	}
};
var InvalidRequest = class InvalidRequest extends S3ServiceException {
	name = "InvalidRequest";
	$fault = "client";
	constructor(opts) {
		super({
			name: "InvalidRequest",
			$fault: "client",
			...opts
		});
		Object.setPrototypeOf(this, InvalidRequest.prototype);
	}
};
var InvalidWriteOffset = class InvalidWriteOffset extends S3ServiceException {
	name = "InvalidWriteOffset";
	$fault = "client";
	constructor(opts) {
		super({
			name: "InvalidWriteOffset",
			$fault: "client",
			...opts
		});
		Object.setPrototypeOf(this, InvalidWriteOffset.prototype);
	}
};
var TooManyParts = class TooManyParts extends S3ServiceException {
	name = "TooManyParts";
	$fault = "client";
	constructor(opts) {
		super({
			name: "TooManyParts",
			$fault: "client",
			...opts
		});
		Object.setPrototypeOf(this, TooManyParts.prototype);
	}
};
var AnnotationLimitExceeded = class AnnotationLimitExceeded extends S3ServiceException {
	name = "AnnotationLimitExceeded";
	$fault = "client";
	constructor(opts) {
		super({
			name: "AnnotationLimitExceeded",
			$fault: "client",
			...opts
		});
		Object.setPrototypeOf(this, AnnotationLimitExceeded.prototype);
	}
};
var AnnotationNameTooLong = class AnnotationNameTooLong extends S3ServiceException {
	name = "AnnotationNameTooLong";
	$fault = "client";
	constructor(opts) {
		super({
			name: "AnnotationNameTooLong",
			$fault: "client",
			...opts
		});
		Object.setPrototypeOf(this, AnnotationNameTooLong.prototype);
	}
};
var InvalidAnnotationName = class InvalidAnnotationName extends S3ServiceException {
	name = "InvalidAnnotationName";
	$fault = "client";
	constructor(opts) {
		super({
			name: "InvalidAnnotationName",
			$fault: "client",
			...opts
		});
		Object.setPrototypeOf(this, InvalidAnnotationName.prototype);
	}
};
var UnsupportedMediaType = class UnsupportedMediaType extends S3ServiceException {
	name = "UnsupportedMediaType";
	$fault = "client";
	constructor(opts) {
		super({
			name: "UnsupportedMediaType",
			$fault: "client",
			...opts
		});
		Object.setPrototypeOf(this, UnsupportedMediaType.prototype);
	}
};
var IdempotencyParameterMismatch = class IdempotencyParameterMismatch extends S3ServiceException {
	name = "IdempotencyParameterMismatch";
	$fault = "client";
	constructor(opts) {
		super({
			name: "IdempotencyParameterMismatch",
			$fault: "client",
			...opts
		});
		Object.setPrototypeOf(this, IdempotencyParameterMismatch.prototype);
	}
};
var ObjectAlreadyInActiveTierError = class ObjectAlreadyInActiveTierError extends S3ServiceException {
	name = "ObjectAlreadyInActiveTierError";
	$fault = "client";
	constructor(opts) {
		super({
			name: "ObjectAlreadyInActiveTierError",
			$fault: "client",
			...opts
		});
		Object.setPrototypeOf(this, ObjectAlreadyInActiveTierError.prototype);
	}
};
//#endregion
//#region ../../node_modules/@aws-sdk/client-s3/dist-es/schemas/schemas_0.js
init_schema();
var _ACL_ = "ACL";
var _AD = "AccessDenied";
var _AKI$1 = "AccessKeyId";
var _ALE = "AnnotationLimitExceeded";
var _ANTL = "AnnotationNameTooLong";
var _AR$1 = "AcceptRanges";
var _AT$2 = "AccessTier";
var _B = "Bucket";
var _BAE = "BucketAlreadyExists";
var _BAOBY = "BucketAlreadyOwnedByYou";
var _BKE = "BucketKeyEnabled";
var _Bo = "Body";
var _CA$1 = "ChecksumAlgorithm";
var _CC = "CacheControl";
var _CCRC = "ChecksumCRC32";
var _CCRCC = "ChecksumCRC32C";
var _CCRCNVME = "ChecksumCRC64NVME";
var _CC_ = "Cache-Control";
var _CD_ = "Content-Disposition";
var _CDo = "ContentDisposition";
var _CE_ = "Content-Encoding";
var _CEo = "ContentEncoding";
var _CL = "ContentLanguage";
var _CL_ = "Content-Language";
var _CL__ = "Content-Length";
var _CLo = "ContentLength";
var _CM = "Content-MD5";
var _CMD = "ChecksumMD5";
var _CMDo = "ContentMD5";
var _CMh = "ChecksumMode";
var _CP = "CommonPrefix";
var _CPL = "CommonPrefixList";
var _CPom = "CommonPrefixes";
var _CR = "ContentRange";
var _CR_ = "Content-Range";
var _CSHA = "ChecksumSHA1";
var _CSHAh = "ChecksumSHA256";
var _CSHAhe = "ChecksumSHA512";
var _CSO = "CreateSessionOutput";
var _CSR = "CreateSessionResult";
var _CSRr = "CreateSessionRequest";
var _CSr = "CreateSession";
var _CT$1 = "ChecksumType";
var _CT_ = "Content-Type";
var _CTo = "ContentType";
var _CTon = "ContinuationToken";
var _CXXHASH = "ChecksumXXHASH64";
var _CXXHASHh = "ChecksumXXHASH3";
var _CXXHASHhe = "ChecksumXXHASH128";
var _Con = "Contents";
var _Cr = "Credentials";
var _DM = "DeleteMarker";
var _DN = "DisplayName";
var _Deli = "Delimiter";
var _EBO = "ExpectedBucketOwner";
var _ES = "ExpiresString";
var _ET = "ETag";
var _ETM = "EncryptionTypeMismatch";
var _ETnc = "EncodingType";
var _Ex = "Expiration";
var _Exp = "Expires";
var _FO = "FetchOwner";
var _GFC = "GrantFullControl";
var _GO = "GetObject";
var _GOO = "GetObjectOutput";
var _GOR = "GetObjectRequest";
var _GR = "GrantRead";
var _GRACP = "GrantReadACP";
var _GWACP = "GrantWriteACP";
var _IAN = "InvalidAnnotationName";
var _ID = "ID";
var _IM = "IfMatch";
var _IMS_ = "If-Modified-Since";
var _IMSf = "IfModifiedSince";
var _IM_ = "If-Match";
var _INM = "IfNoneMatch";
var _INM_ = "If-None-Match";
var _IOS = "InvalidObjectState";
var _IP = "InvalidPrefix";
var _IPM = "IdempotencyParameterMismatch";
var _IR = "InvalidRequest";
var _IRIP = "IsRestoreInProgress";
var _IT$1 = "IsTruncated";
var _IUS = "IfUnmodifiedSince";
var _IUS_ = "If-Unmodified-Since";
var _IWO = "InvalidWriteOffset";
var _K$1 = "Key";
var _KC = "KeyCount";
var _LBRi = "ListBucketResult";
var _LM = "LastModified";
var _LM_ = "Last-Modified";
var _LOV = "ListObjectsV2";
var _LOVO = "ListObjectsV2Output";
var _LOVR = "ListObjectsV2Request";
var _M = "Metadata";
var _MK = "MaxKeys";
var _MM = "MissingMeta";
var _N = "Name";
var _NCT = "NextContinuationToken";
var _NF = "NotFound";
var _NSA = "NoSuchAnnotation";
var _NSB = "NoSuchBucket";
var _NSK = "NoSuchKey";
var _NSU = "NoSuchUpload";
var _O = "Owner";
var _OAIATE = "ObjectAlreadyInActiveTierError";
var _OLEH = "ObjectLockEventHold";
var _OLEHDD = "ObjectLockEventHoldDurationDays";
var _OLEHDY = "ObjectLockEventHoldDurationYears";
var _OLLHS = "ObjectLockLegalHoldStatus";
var _OLM = "ObjectLockMode";
var _OLRUD = "ObjectLockRetainUntilDate";
var _OLb = "ObjectList";
var _ONIATE = "ObjectNotInActiveTierError";
var _OOA = "OptionalObjectAttributes";
var _Obj = "Object";
var _P$1 = "Prefix";
var _PC$1 = "PartsCount";
var _PN = "PartNumber";
var _PO = "PutObject";
var _POO = "PutObjectOutput";
var _POR = "PutObjectRequest";
var _RC$1 = "RequestCharged";
var _RCC = "ResponseCacheControl";
var _RCD = "ResponseContentDisposition";
var _RCE = "ResponseContentEncoding";
var _RCL = "ResponseContentLanguage";
var _RCT = "ResponseContentType";
var _RE = "ResponseExpires";
var _RED = "RestoreExpiryDate";
var _RP = "RequestPayer";
var _RS = "ReplicationStatus";
var _RSe = "RestoreStatus";
var _Ra = "Range";
var _Re = "Restore";
var _SA = "StartAfter";
var _SAK$1 = "SecretAccessKey";
var _SB = "StreamingBlob";
var _SC = "StorageClass";
var _SCV = "SessionCredentialValue";
var _SCe = "SessionCredentials";
var _SM = "SessionMode";
var _SSE = "ServerSideEncryption";
var _SSECA = "SSECustomerAlgorithm";
var _SSECK = "SSECustomerKey";
var _SSECKMD = "SSECustomerKeyMD5";
var _SSEKMSEC = "SSEKMSEncryptionContext";
var _SSEKMSKI = "SSEKMSKeyId";
var _ST$1 = "SessionToken";
var _Si = "Size";
var _TC$1 = "TagCount";
var _TMP = "TooManyParts";
var _Tag = "Tagging";
var _UMT = "UnsupportedMediaType";
var _VI = "VersionId";
var _WOB = "WriteOffsetBytes";
var _WRL = "WebsiteRedirectLocation";
var _ar = "accept-ranges";
var _c$4 = "client";
var _ct = "continuation-token";
var _d = "delimiter";
var _e$4 = "error";
var _et = "encoding-type";
var _fo = "fetch-owner";
var _h$3 = "http";
var _hC = "httpChecksum";
var _hE$4 = "httpError";
var _hH$1 = "httpHeader";
var _hPH = "httpPrefixHeaders";
var _hQ$1 = "httpQuery";
var _mk = "max-keys";
var _p = "prefix";
var _pN = "partNumber";
var _rcc = "response-cache-control";
var _rcd = "response-content-disposition";
var _rce = "response-content-encoding";
var _rcl = "response-content-language";
var _rct = "response-content-type";
var _re = "response-expires";
var _s$4 = "smithy.ts.sdk.synthetic.com.amazonaws.s3";
var _sa = "start-after";
var _st = "streaming";
var _vI = "versionId";
var _xF = "xmlFlattened";
var _xN = "xmlName";
var _xaa = "x-amz-acl";
var _xacc = "x-amz-checksum-crc32";
var _xacc_ = "x-amz-checksum-crc32c";
var _xacc__ = "x-amz-checksum-crc64nvme";
var _xacm = "x-amz-checksum-md5";
var _xacm_ = "x-amz-checksum-mode";
var _xacs = "x-amz-checksum-sha1";
var _xacs_ = "x-amz-checksum-sha256";
var _xacs__ = "x-amz-checksum-sha512";
var _xacsm = "x-amz-create-session-mode";
var _xact = "x-amz-checksum-type";
var _xacx = "x-amz-checksum-xxhash64";
var _xacx_ = "x-amz-checksum-xxhash3";
var _xacx__ = "x-amz-checksum-xxhash128";
var _xadm = "x-amz-delete-marker";
var _xae = "x-amz-expiration";
var _xaebo = "x-amz-expected-bucket-owner";
var _xagfc = "x-amz-grant-full-control";
var _xagr = "x-amz-grant-read";
var _xagra = "x-amz-grant-read-acp";
var _xagwa = "x-amz-grant-write-acp";
var _xam = "x-amz-meta-";
var _xamm = "x-amz-missing-meta";
var _xampc = "x-amz-mp-parts-count";
var _xaoleh = "x-amz-object-lock-event-hold";
var _xaolehdd = "x-amz-object-lock-event-hold-duration-days";
var _xaolehdy = "x-amz-object-lock-event-hold-duration-years";
var _xaollh = "x-amz-object-lock-legal-hold";
var _xaolm = "x-amz-object-lock-mode";
var _xaolrud = "x-amz-object-lock-retain-until-date";
var _xaooa = "x-amz-optional-object-attributes";
var _xaos = "x-amz-object-size";
var _xar = "x-amz-restore";
var _xarc = "x-amz-request-charged";
var _xarp = "x-amz-request-payer";
var _xars = "x-amz-replication-status";
var _xasc = "x-amz-storage-class";
var _xasca = "x-amz-sdk-checksum-algorithm";
var _xasse = "x-amz-server-side-encryption";
var _xasseakki = "x-amz-server-side-encryption-aws-kms-key-id";
var _xassebke = "x-amz-server-side-encryption-bucket-key-enabled";
var _xassec = "x-amz-server-side-encryption-context";
var _xasseca = "x-amz-server-side-encryption-customer-algorithm";
var _xasseck = "x-amz-server-side-encryption-customer-key";
var _xasseckM = "x-amz-server-side-encryption-customer-key-MD5";
var _xat = "x-amz-tagging";
var _xatc = "x-amz-tagging-count";
var _xavi = "x-amz-version-id";
var _xawob = "x-amz-write-offset-bytes";
var _xawrl = "x-amz-website-redirect-location";
var n0$4 = "com.amazonaws.s3";
var _s_registry$4 = new TypeRegistry(_s$4);
var S3ServiceException$ = [
	-3,
	_s$4,
	"S3ServiceException",
	0,
	[],
	[]
];
_s_registry$4.registerError(S3ServiceException$, S3ServiceException);
var n0_registry$4 = new TypeRegistry(n0$4);
var AccessDenied$ = [
	-3,
	n0$4,
	_AD,
	{
		[_e$4]: _c$4,
		[_hE$4]: 403
	},
	[],
	[]
];
n0_registry$4.registerError(AccessDenied$, AccessDenied);
var AnnotationLimitExceeded$ = [
	-3,
	n0$4,
	_ALE,
	{
		[_e$4]: _c$4,
		[_hE$4]: 400
	},
	[],
	[]
];
n0_registry$4.registerError(AnnotationLimitExceeded$, AnnotationLimitExceeded);
var AnnotationNameTooLong$ = [
	-3,
	n0$4,
	_ANTL,
	{
		[_e$4]: _c$4,
		[_hE$4]: 400
	},
	[],
	[]
];
n0_registry$4.registerError(AnnotationNameTooLong$, AnnotationNameTooLong);
var BucketAlreadyExists$ = [
	-3,
	n0$4,
	_BAE,
	{
		[_e$4]: _c$4,
		[_hE$4]: 409
	},
	[],
	[]
];
n0_registry$4.registerError(BucketAlreadyExists$, BucketAlreadyExists);
var BucketAlreadyOwnedByYou$ = [
	-3,
	n0$4,
	_BAOBY,
	{
		[_e$4]: _c$4,
		[_hE$4]: 409
	},
	[],
	[]
];
n0_registry$4.registerError(BucketAlreadyOwnedByYou$, BucketAlreadyOwnedByYou);
var EncryptionTypeMismatch$ = [
	-3,
	n0$4,
	_ETM,
	{
		[_e$4]: _c$4,
		[_hE$4]: 400
	},
	[],
	[]
];
n0_registry$4.registerError(EncryptionTypeMismatch$, EncryptionTypeMismatch);
var IdempotencyParameterMismatch$ = [
	-3,
	n0$4,
	_IPM,
	{
		[_e$4]: _c$4,
		[_hE$4]: 400
	},
	[],
	[]
];
n0_registry$4.registerError(IdempotencyParameterMismatch$, IdempotencyParameterMismatch);
var InvalidAnnotationName$ = [
	-3,
	n0$4,
	_IAN,
	{
		[_e$4]: _c$4,
		[_hE$4]: 400
	},
	[],
	[]
];
n0_registry$4.registerError(InvalidAnnotationName$, InvalidAnnotationName);
var InvalidObjectState$ = [
	-3,
	n0$4,
	_IOS,
	{
		[_e$4]: _c$4,
		[_hE$4]: 403
	},
	[_SC, _AT$2],
	[0, 0]
];
n0_registry$4.registerError(InvalidObjectState$, InvalidObjectState);
var InvalidPrefix$ = [
	-3,
	n0$4,
	_IP,
	{
		[_e$4]: _c$4,
		[_hE$4]: 400
	},
	[],
	[]
];
n0_registry$4.registerError(InvalidPrefix$, InvalidPrefix);
var InvalidRequest$ = [
	-3,
	n0$4,
	_IR,
	{
		[_e$4]: _c$4,
		[_hE$4]: 400
	},
	[],
	[]
];
n0_registry$4.registerError(InvalidRequest$, InvalidRequest);
var InvalidWriteOffset$ = [
	-3,
	n0$4,
	_IWO,
	{
		[_e$4]: _c$4,
		[_hE$4]: 400
	},
	[],
	[]
];
n0_registry$4.registerError(InvalidWriteOffset$, InvalidWriteOffset);
var NoSuchAnnotation$ = [
	-3,
	n0$4,
	_NSA,
	{
		[_e$4]: _c$4,
		[_hE$4]: 404
	},
	[],
	[]
];
n0_registry$4.registerError(NoSuchAnnotation$, NoSuchAnnotation);
var NoSuchBucket$ = [
	-3,
	n0$4,
	_NSB,
	{
		[_e$4]: _c$4,
		[_hE$4]: 404
	},
	[],
	[]
];
n0_registry$4.registerError(NoSuchBucket$, NoSuchBucket);
var NoSuchKey$ = [
	-3,
	n0$4,
	_NSK,
	{
		[_e$4]: _c$4,
		[_hE$4]: 404
	},
	[],
	[]
];
n0_registry$4.registerError(NoSuchKey$, NoSuchKey);
var NoSuchUpload$ = [
	-3,
	n0$4,
	_NSU,
	{
		[_e$4]: _c$4,
		[_hE$4]: 404
	},
	[],
	[]
];
n0_registry$4.registerError(NoSuchUpload$, NoSuchUpload);
var NotFound$ = [
	-3,
	n0$4,
	_NF,
	{ [_e$4]: _c$4 },
	[],
	[]
];
n0_registry$4.registerError(NotFound$, NotFound);
var ObjectAlreadyInActiveTierError$ = [
	-3,
	n0$4,
	_OAIATE,
	{
		[_e$4]: _c$4,
		[_hE$4]: 403
	},
	[],
	[]
];
n0_registry$4.registerError(ObjectAlreadyInActiveTierError$, ObjectAlreadyInActiveTierError);
var ObjectNotInActiveTierError$ = [
	-3,
	n0$4,
	_ONIATE,
	{
		[_e$4]: _c$4,
		[_hE$4]: 403
	},
	[],
	[]
];
n0_registry$4.registerError(ObjectNotInActiveTierError$, ObjectNotInActiveTierError);
var TooManyParts$ = [
	-3,
	n0$4,
	_TMP,
	{
		[_e$4]: _c$4,
		[_hE$4]: 400
	},
	[],
	[]
];
n0_registry$4.registerError(TooManyParts$, TooManyParts);
var UnsupportedMediaType$ = [
	-3,
	n0$4,
	_UMT,
	{
		[_e$4]: _c$4,
		[_hE$4]: 415
	},
	[],
	[]
];
n0_registry$4.registerError(UnsupportedMediaType$, UnsupportedMediaType);
var errorTypeRegistries$4 = [_s_registry$4, n0_registry$4];
var SessionCredentialValue = [
	0,
	n0$4,
	_SCV,
	8,
	0
];
var SSECustomerKey = [
	0,
	n0$4,
	_SSECK,
	8,
	0
];
var SSEKMSEncryptionContext = [
	0,
	n0$4,
	_SSEKMSEC,
	8,
	0
];
var SSEKMSKeyId = [
	0,
	n0$4,
	_SSEKMSKI,
	8,
	0
];
var StreamingBlob = [
	0,
	n0$4,
	_SB,
	{ [_st]: 1 },
	42
];
var CommonPrefix$ = [
	3,
	n0$4,
	_CP,
	0,
	[_P$1],
	[0]
];
var CreateSessionOutput$ = [
	3,
	n0$4,
	_CSO,
	{ [_xN]: _CSR },
	[
		_Cr,
		_SSE,
		_SSEKMSKI,
		_SSEKMSEC,
		_BKE
	],
	[
		[() => SessionCredentials$, { [_xN]: _Cr }],
		[0, { [_hH$1]: _xasse }],
		[() => SSEKMSKeyId, { [_hH$1]: _xasseakki }],
		[() => SSEKMSEncryptionContext, { [_hH$1]: _xassec }],
		[2, { [_hH$1]: _xassebke }]
	],
	1
];
var CreateSessionRequest$ = [
	3,
	n0$4,
	_CSRr,
	0,
	[
		_B,
		_SM,
		_SSE,
		_SSEKMSKI,
		_SSEKMSEC,
		_BKE
	],
	[
		[0, 1],
		[0, { [_hH$1]: _xacsm }],
		[0, { [_hH$1]: _xasse }],
		[() => SSEKMSKeyId, { [_hH$1]: _xasseakki }],
		[() => SSEKMSEncryptionContext, { [_hH$1]: _xassec }],
		[2, { [_hH$1]: _xassebke }]
	],
	1
];
var GetObjectOutput$ = [
	3,
	n0$4,
	_GOO,
	0,
	[
		_Bo,
		_DM,
		_AR$1,
		_Ex,
		_Re,
		_LM,
		_CLo,
		_ET,
		_CCRC,
		_CCRCC,
		_CCRCNVME,
		_CSHA,
		_CSHAh,
		_CSHAhe,
		_CMD,
		_CXXHASH,
		_CXXHASHh,
		_CXXHASHhe,
		_CT$1,
		_MM,
		_VI,
		_CC,
		_CDo,
		_CEo,
		_CL,
		_CR,
		_CTo,
		_Exp,
		_ES,
		_WRL,
		_SSE,
		_M,
		_SSECA,
		_SSECKMD,
		_SSEKMSKI,
		_BKE,
		_SC,
		_RC$1,
		_RS,
		_PC$1,
		_TC$1,
		_OLM,
		_OLRUD,
		_OLLHS,
		_OLEH,
		_OLEHDD,
		_OLEHDY
	],
	[
		[() => StreamingBlob, 16],
		[2, { [_hH$1]: _xadm }],
		[0, { [_hH$1]: _ar }],
		[0, { [_hH$1]: _xae }],
		[0, { [_hH$1]: _xar }],
		[4, { [_hH$1]: _LM_ }],
		[1, { [_hH$1]: _CL__ }],
		[0, { [_hH$1]: _ET }],
		[0, { [_hH$1]: _xacc }],
		[0, { [_hH$1]: _xacc_ }],
		[0, { [_hH$1]: _xacc__ }],
		[0, { [_hH$1]: _xacs }],
		[0, { [_hH$1]: _xacs_ }],
		[0, { [_hH$1]: _xacs__ }],
		[0, { [_hH$1]: _xacm }],
		[0, { [_hH$1]: _xacx }],
		[0, { [_hH$1]: _xacx_ }],
		[0, { [_hH$1]: _xacx__ }],
		[0, { [_hH$1]: _xact }],
		[1, { [_hH$1]: _xamm }],
		[0, { [_hH$1]: _xavi }],
		[0, { [_hH$1]: _CC_ }],
		[0, { [_hH$1]: _CD_ }],
		[0, { [_hH$1]: _CE_ }],
		[0, { [_hH$1]: _CL_ }],
		[0, { [_hH$1]: _CR_ }],
		[0, { [_hH$1]: _CT_ }],
		[4, { [_hH$1]: _Exp }],
		[0, { [_hH$1]: _ES }],
		[0, { [_hH$1]: _xawrl }],
		[0, { [_hH$1]: _xasse }],
		[128, { [_hPH]: _xam }],
		[0, { [_hH$1]: _xasseca }],
		[0, { [_hH$1]: _xasseckM }],
		[() => SSEKMSKeyId, { [_hH$1]: _xasseakki }],
		[2, { [_hH$1]: _xassebke }],
		[0, { [_hH$1]: _xasc }],
		[0, { [_hH$1]: _xarc }],
		[0, { [_hH$1]: _xars }],
		[1, { [_hH$1]: _xampc }],
		[1, { [_hH$1]: _xatc }],
		[0, { [_hH$1]: _xaolm }],
		[5, { [_hH$1]: _xaolrud }],
		[0, { [_hH$1]: _xaollh }],
		[0, { [_hH$1]: _xaoleh }],
		[1, { [_hH$1]: _xaolehdd }],
		[1, { [_hH$1]: _xaolehdy }]
	]
];
var GetObjectRequest$ = [
	3,
	n0$4,
	_GOR,
	0,
	[
		_B,
		_K$1,
		_IM,
		_IMSf,
		_INM,
		_IUS,
		_Ra,
		_RCC,
		_RCD,
		_RCE,
		_RCL,
		_RCT,
		_RE,
		_VI,
		_SSECA,
		_SSECK,
		_SSECKMD,
		_RP,
		_PN,
		_EBO,
		_CMh
	],
	[
		[0, 1],
		[0, 1],
		[0, { [_hH$1]: _IM_ }],
		[4, { [_hH$1]: _IMS_ }],
		[0, { [_hH$1]: _INM_ }],
		[4, { [_hH$1]: _IUS_ }],
		[0, { [_hH$1]: _Ra }],
		[0, { [_hQ$1]: _rcc }],
		[0, { [_hQ$1]: _rcd }],
		[0, { [_hQ$1]: _rce }],
		[0, { [_hQ$1]: _rcl }],
		[0, { [_hQ$1]: _rct }],
		[6, { [_hQ$1]: _re }],
		[0, { [_hQ$1]: _vI }],
		[0, { [_hH$1]: _xasseca }],
		[() => SSECustomerKey, { [_hH$1]: _xasseck }],
		[0, { [_hH$1]: _xasseckM }],
		[0, { [_hH$1]: _xarp }],
		[1, { [_hQ$1]: _pN }],
		[0, { [_hH$1]: _xaebo }],
		[0, { [_hH$1]: _xacm_ }]
	],
	2
];
var ListObjectsV2Output$ = [
	3,
	n0$4,
	_LOVO,
	{ [_xN]: _LBRi },
	[
		_IT$1,
		_Con,
		_N,
		_P$1,
		_Deli,
		_MK,
		_CPom,
		_ETnc,
		_KC,
		_CTon,
		_NCT,
		_SA,
		_RC$1
	],
	[
		2,
		[() => ObjectList, { [_xF]: 1 }],
		0,
		0,
		0,
		1,
		[() => CommonPrefixList, { [_xF]: 1 }],
		0,
		1,
		0,
		0,
		0,
		[0, { [_hH$1]: _xarc }]
	]
];
var ListObjectsV2Request$ = [
	3,
	n0$4,
	_LOVR,
	0,
	[
		_B,
		_Deli,
		_ETnc,
		_MK,
		_P$1,
		_CTon,
		_FO,
		_SA,
		_RP,
		_EBO,
		_OOA
	],
	[
		[0, 1],
		[0, { [_hQ$1]: _d }],
		[0, { [_hQ$1]: _et }],
		[1, { [_hQ$1]: _mk }],
		[0, { [_hQ$1]: _p }],
		[0, { [_hQ$1]: _ct }],
		[2, { [_hQ$1]: _fo }],
		[0, { [_hQ$1]: _sa }],
		[0, { [_hH$1]: _xarp }],
		[0, { [_hH$1]: _xaebo }],
		[64, { [_hH$1]: _xaooa }]
	],
	1
];
var _Object$ = [
	3,
	n0$4,
	_Obj,
	0,
	[
		_K$1,
		_LM,
		_ET,
		_CA$1,
		_CT$1,
		_Si,
		_SC,
		_O,
		_RSe
	],
	[
		0,
		4,
		0,
		[64, { [_xF]: 1 }],
		0,
		1,
		0,
		() => Owner$,
		() => RestoreStatus$
	]
];
var Owner$ = [
	3,
	n0$4,
	_O,
	0,
	[_DN, _ID],
	[0, 0]
];
var PutObjectOutput$ = [
	3,
	n0$4,
	_POO,
	0,
	[
		_Ex,
		_ET,
		_CCRC,
		_CCRCC,
		_CCRCNVME,
		_CSHA,
		_CSHAh,
		_CSHAhe,
		_CMD,
		_CXXHASH,
		_CXXHASHh,
		_CXXHASHhe,
		_CT$1,
		_SSE,
		_VI,
		_SSECA,
		_SSECKMD,
		_SSEKMSKI,
		_SSEKMSEC,
		_BKE,
		_Si,
		_RC$1
	],
	[
		[0, { [_hH$1]: _xae }],
		[0, { [_hH$1]: _ET }],
		[0, { [_hH$1]: _xacc }],
		[0, { [_hH$1]: _xacc_ }],
		[0, { [_hH$1]: _xacc__ }],
		[0, { [_hH$1]: _xacs }],
		[0, { [_hH$1]: _xacs_ }],
		[0, { [_hH$1]: _xacs__ }],
		[0, { [_hH$1]: _xacm }],
		[0, { [_hH$1]: _xacx }],
		[0, { [_hH$1]: _xacx_ }],
		[0, { [_hH$1]: _xacx__ }],
		[0, { [_hH$1]: _xact }],
		[0, { [_hH$1]: _xasse }],
		[0, { [_hH$1]: _xavi }],
		[0, { [_hH$1]: _xasseca }],
		[0, { [_hH$1]: _xasseckM }],
		[() => SSEKMSKeyId, { [_hH$1]: _xasseakki }],
		[() => SSEKMSEncryptionContext, { [_hH$1]: _xassec }],
		[2, { [_hH$1]: _xassebke }],
		[1, { [_hH$1]: _xaos }],
		[0, { [_hH$1]: _xarc }]
	]
];
var PutObjectRequest$ = [
	3,
	n0$4,
	_POR,
	0,
	[
		_B,
		_K$1,
		_ACL_,
		_Bo,
		_CC,
		_CDo,
		_CEo,
		_CL,
		_CLo,
		_CMDo,
		_CTo,
		_CA$1,
		_CCRC,
		_CCRCC,
		_CCRCNVME,
		_CSHA,
		_CSHAh,
		_CSHAhe,
		_CMD,
		_CXXHASH,
		_CXXHASHh,
		_CXXHASHhe,
		_Exp,
		_IM,
		_INM,
		_GFC,
		_GR,
		_GRACP,
		_GWACP,
		_WOB,
		_M,
		_SSE,
		_SC,
		_WRL,
		_SSECA,
		_SSECK,
		_SSECKMD,
		_SSEKMSKI,
		_SSEKMSEC,
		_BKE,
		_RP,
		_Tag,
		_OLM,
		_OLRUD,
		_OLLHS,
		_OLEH,
		_OLEHDD,
		_OLEHDY,
		_EBO
	],
	[
		[0, 1],
		[0, 1],
		[0, { [_hH$1]: _xaa }],
		[() => StreamingBlob, 16],
		[0, { [_hH$1]: _CC_ }],
		[0, { [_hH$1]: _CD_ }],
		[0, { [_hH$1]: _CE_ }],
		[0, { [_hH$1]: _CL_ }],
		[1, { [_hH$1]: _CL__ }],
		[0, { [_hH$1]: _CM }],
		[0, { [_hH$1]: _CT_ }],
		[0, { [_hH$1]: _xasca }],
		[0, { [_hH$1]: _xacc }],
		[0, { [_hH$1]: _xacc_ }],
		[0, { [_hH$1]: _xacc__ }],
		[0, { [_hH$1]: _xacs }],
		[0, { [_hH$1]: _xacs_ }],
		[0, { [_hH$1]: _xacs__ }],
		[0, { [_hH$1]: _xacm }],
		[0, { [_hH$1]: _xacx }],
		[0, { [_hH$1]: _xacx_ }],
		[0, { [_hH$1]: _xacx__ }],
		[4, { [_hH$1]: _Exp }],
		[0, { [_hH$1]: _IM_ }],
		[0, { [_hH$1]: _INM_ }],
		[0, { [_hH$1]: _xagfc }],
		[0, { [_hH$1]: _xagr }],
		[0, { [_hH$1]: _xagra }],
		[0, { [_hH$1]: _xagwa }],
		[1, { [_hH$1]: _xawob }],
		[128, { [_hPH]: _xam }],
		[0, { [_hH$1]: _xasse }],
		[0, { [_hH$1]: _xasc }],
		[0, { [_hH$1]: _xawrl }],
		[0, { [_hH$1]: _xasseca }],
		[() => SSECustomerKey, { [_hH$1]: _xasseck }],
		[0, { [_hH$1]: _xasseckM }],
		[() => SSEKMSKeyId, { [_hH$1]: _xasseakki }],
		[() => SSEKMSEncryptionContext, { [_hH$1]: _xassec }],
		[2, { [_hH$1]: _xassebke }],
		[0, { [_hH$1]: _xarp }],
		[0, { [_hH$1]: _xat }],
		[0, { [_hH$1]: _xaolm }],
		[5, { [_hH$1]: _xaolrud }],
		[0, { [_hH$1]: _xaollh }],
		[0, { [_hH$1]: _xaoleh }],
		[1, { [_hH$1]: _xaolehdd }],
		[1, { [_hH$1]: _xaolehdy }],
		[0, { [_hH$1]: _xaebo }]
	],
	2
];
var RestoreStatus$ = [
	3,
	n0$4,
	_RSe,
	0,
	[_IRIP, _RED],
	[2, 4]
];
var SessionCredentials$ = [
	3,
	n0$4,
	_SCe,
	0,
	[
		_AKI$1,
		_SAK$1,
		_ST$1,
		_Ex
	],
	[
		[0, { [_xN]: _AKI$1 }],
		[() => SessionCredentialValue, { [_xN]: _SAK$1 }],
		[() => SessionCredentialValue, { [_xN]: _ST$1 }],
		[4, { [_xN]: _Ex }]
	],
	4
];
var CommonPrefixList = [
	1,
	n0$4,
	_CPL,
	0,
	() => CommonPrefix$
];
var ObjectList = [
	1,
	n0$4,
	_OLb,
	0,
	[() => _Object$, 0]
];
var CreateSession$ = [
	9,
	n0$4,
	_CSr,
	{ [_h$3]: [
		"GET",
		"/?session",
		200
	] },
	() => CreateSessionRequest$,
	() => CreateSessionOutput$
];
var GetObject$ = [
	9,
	n0$4,
	_GO,
	{
		[_hC]: "-",
		[_h$3]: [
			"GET",
			"/{Key+}?x-id=GetObject",
			200
		]
	},
	() => GetObjectRequest$,
	() => GetObjectOutput$
];
var ListObjectsV2$ = [
	9,
	n0$4,
	_LOV,
	{ [_h$3]: [
		"GET",
		"/?list-type=2",
		200
	] },
	() => ListObjectsV2Request$,
	() => ListObjectsV2Output$
];
var PutObject$ = [
	9,
	n0$4,
	_PO,
	{
		[_hC]: "-",
		[_h$3]: [
			"PUT",
			"/{Key+}?x-id=PutObject",
			200
		]
	},
	() => PutObjectRequest$,
	() => PutObjectOutput$
];
//#endregion
//#region ../../node_modules/@aws-sdk/client-s3/dist-es/commands/CreateSessionCommand.js
var CreateSessionCommand = class extends command$4(_ep4, _mw0$4, "CreateSession", CreateSession$) {};
var package_default$1 = {
	name: "@aws-sdk/client-s3",
	version: "3.1141.0",
	description: "AWS SDK for JavaScript S3 Client for Node.js, Browser and React Native",
	homepage: "https://github.com/aws/aws-sdk-js-v3/tree/main/clients/client-s3",
	license: "Apache-2.0",
	author: {
		"name": "AWS SDK for JavaScript Team",
		"url": "https://aws.amazon.com/sdk-for-javascript/"
	},
	repository: {
		"type": "git",
		"url": "https://github.com/aws/aws-sdk-js-v3.git",
		"directory": "clients/client-s3"
	},
	files: ["dist-*/**"],
	sideEffects: false,
	main: "./dist-cjs/index.js",
	module: "./dist-es/index.js",
	browser: { "./dist-es/runtimeConfig": "./dist-es/runtimeConfig.browser" },
	types: "./dist-types/index.d.ts",
	typesVersions: { "<4.5": { "dist-types/*": ["dist-types/ts3.4/*"] } },
	"react-native": { "./dist-es/runtimeConfig": "./dist-es/runtimeConfig.native" },
	scripts: {
		"build": "concurrently 'yarn:build:types' 'yarn:build:es' && yarn build:cjs",
		"build:cjs": "node ../../scripts/compilation/inline",
		"build:es": "premove dist-es && tsc -p tsconfig.es.json",
		"build:include:deps": "yarn g:turbo run build -F=\"$npm_package_name\"",
		"build:types": "premove dist-types && tsc -p tsconfig.types.json",
		"build:types:downlevel": "downlevel-dts dist-types dist-types/ts3.4",
		"clean": "premove dist-cjs dist-es dist-types",
		"extract:docs": "api-extractor run --local",
		"generate:client": "node ../../scripts/generate-clients/single-service",
		"test": "yarn g:vitest run --passWithNoTests",
		"test:watch": "yarn g:vitest watch --passWithNoTests",
		"test:integration": "yarn g:vitest run --passWithNoTests -c vitest.config.integ.mts",
		"test:integration:watch": "yarn g:vitest watch --passWithNoTests -c vitest.config.integ.mts",
		"test:e2e": "yarn g:vitest run -c vitest.config.e2e.mts",
		"test:e2e:watch": "yarn g:vitest watch -c vitest.config.e2e.mts",
		"test:browser": "yarn g:vitest run -c vitest.config.browser.mts",
		"test:browser:watch": "yarn g:vitest watch -c vitest.config.browser.mts",
		"test:index": "tsc -p tsconfig.test.json && node ./test/index-objects.spec.mjs"
	},
	dependencies: {
		"@aws-sdk/checksums": "^3.1001.1",
		"@aws-sdk/core": "^3.978.1",
		"@aws-sdk/credential-provider-node": "^3.972.84",
		"@aws-sdk/middleware-sdk-s3": "^3.972.77",
		"@aws-sdk/signature-v4-multi-region": "^3.996.47",
		"@aws-sdk/types": "^3.974.6",
		"@smithy/core": "^3.35.0",
		"@smithy/fetch-http-handler": "^5.8.0",
		"@smithy/node-http-handler": "^4.12.1",
		"@smithy/types": "^4.19.0",
		"tslib": "^2.6.2"
	},
	devDependencies: {
		"@aws-sdk/signature-v4-crt": "3.1141.0",
		"@smithy/snapshot-testing": "^2.3.2",
		"@tsconfig/node20": "20.1.8",
		"@types/node": "^20.14.8",
		"concurrently": "7.0.0",
		"downlevel-dts": "0.10.1",
		"premove": "4.0.0",
		"typescript": "~7.0.2",
		"vitest": "^4.0.17"
	},
	engines: { "node": ">=20.0.0" }
};
//#endregion
//#region ../../node_modules/@aws-sdk/credential-provider-env/dist-es/fromEnv.js
var ENV_KEY, ENV_SECRET, ENV_SESSION, ENV_EXPIRATION, ENV_CREDENTIAL_SCOPE, ENV_ACCOUNT_ID, fromEnv;
var init_fromEnv = __esmMin((() => {
	init_client();
	init_config$1();
	ENV_KEY = "AWS_ACCESS_KEY_ID";
	ENV_SECRET = "AWS_SECRET_ACCESS_KEY";
	ENV_SESSION = "AWS_SESSION_TOKEN";
	ENV_EXPIRATION = "AWS_CREDENTIAL_EXPIRATION";
	ENV_CREDENTIAL_SCOPE = "AWS_CREDENTIAL_SCOPE";
	ENV_ACCOUNT_ID = "AWS_ACCOUNT_ID";
	fromEnv = (init) => async () => {
		init?.logger?.debug("@aws-sdk/credential-provider-env - fromEnv");
		const accessKeyId = process.env[ENV_KEY];
		const secretAccessKey = process.env[ENV_SECRET];
		const sessionToken = process.env[ENV_SESSION];
		const expiry = process.env[ENV_EXPIRATION];
		const credentialScope = process.env[ENV_CREDENTIAL_SCOPE];
		const accountId = process.env[ENV_ACCOUNT_ID];
		if (accessKeyId && secretAccessKey) {
			const credentials = {
				accessKeyId,
				secretAccessKey,
				...sessionToken && { sessionToken },
				...expiry && { expiration: new Date(expiry) },
				...credentialScope && { credentialScope },
				...accountId && { accountId }
			};
			setCredentialFeature(credentials, "CREDENTIALS_ENV_VARS", "g");
			return credentials;
		}
		throw new CredentialsProviderError("Unable to find environment variable credentials.", { logger: init?.logger });
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/credential-provider-env/dist-es/index.js
var dist_es_exports$7 = /* @__PURE__ */ __exportAll({
	ENV_ACCOUNT_ID: () => ENV_ACCOUNT_ID,
	ENV_CREDENTIAL_SCOPE: () => ENV_CREDENTIAL_SCOPE,
	ENV_EXPIRATION: () => ENV_EXPIRATION,
	ENV_KEY: () => ENV_KEY,
	ENV_SECRET: () => ENV_SECRET,
	ENV_SESSION: () => ENV_SESSION,
	fromEnv: () => fromEnv
});
var init_dist_es$9 = __esmMin((() => {
	init_fromEnv();
}));
//#endregion
//#region ../../node_modules/@smithy/credential-provider-imds/dist-es/remoteProvider/ImdsCredentials.js
var isImdsCredentials, fromImdsCredentials;
var init_ImdsCredentials = __esmMin((() => {
	isImdsCredentials = (arg) => Boolean(arg) && typeof arg === "object" && typeof arg.AccessKeyId === "string" && typeof arg.SecretAccessKey === "string" && typeof arg.Token === "string" && typeof arg.Expiration === "string";
	fromImdsCredentials = (creds) => ({
		accessKeyId: creds.AccessKeyId,
		secretAccessKey: creds.SecretAccessKey,
		sessionToken: creds.Token,
		expiration: new Date(creds.Expiration),
		...creds.AccountId && { accountId: creds.AccountId }
	});
})), DEFAULT_TIMEOUT, providerConfigFromInit;
var init_RemoteProviderInit = __esmMin((() => {
	DEFAULT_TIMEOUT = 1e3;
	providerConfigFromInit = ({ maxRetries = 0, timeout = DEFAULT_TIMEOUT }) => ({
		maxRetries,
		timeout
	});
}));
//#endregion
//#region ../../node_modules/@smithy/credential-provider-imds/dist-es/remoteProvider/node-http.js
var init_node_http = __esmMin((() => {}));
//#endregion
//#region ../../node_modules/@smithy/credential-provider-imds/dist-es/remoteProvider/httpRequest.js
function httpRequest(options) {
	return new Promise((resolve, reject) => {
		const req = node_http.request({
			method: "GET",
			...options,
			hostname: options.hostname?.replace(/^\[(.+)\]$/, "$1")
		});
		req.on("error", (err) => {
			reject(Object.assign(new ProviderError("Unable to connect to instance metadata service"), err));
			req.destroy();
		});
		req.on("timeout", () => {
			reject(new ProviderError("TimeoutError from instance metadata service"));
			req.destroy();
		});
		req.on("response", (res) => {
			const { statusCode = 400 } = res;
			if (statusCode < 200 || 300 <= statusCode) {
				reject(Object.assign(new ProviderError("Error response received from instance metadata service"), { statusCode }));
				req.destroy();
			}
			const chunks = [];
			res.on("data", (chunk) => {
				chunks.push(chunk);
			});
			res.on("end", () => {
				resolve(Buffer.concat(chunks));
				req.destroy();
			});
		});
		req.end();
	});
}
var init_httpRequest = __esmMin((() => {
	init_config$1();
	init_node_http();
}));
//#endregion
//#region ../../node_modules/@smithy/credential-provider-imds/dist-es/remoteProvider/retry.js
var retry;
var init_retry = __esmMin((() => {
	retry = (toRetry, maxRetries) => {
		let promise = toRetry();
		for (let i = 0; i < maxRetries; i++) promise = promise.catch(toRetry);
		return promise;
	};
}));
//#endregion
//#region ../../node_modules/@smithy/credential-provider-imds/dist-es/fromContainerMetadata.js
var ENV_CMDS_FULL_URI, ENV_CMDS_RELATIVE_URI, ENV_CMDS_AUTH_TOKEN, fromContainerMetadata, requestFromEcsImds, CMDS_IP, GREENGRASS_HOSTS, GREENGRASS_PROTOCOLS, getCmdsUri;
var init_fromContainerMetadata = __esmMin((() => {
	init_config$1();
	init_ImdsCredentials();
	init_RemoteProviderInit();
	init_httpRequest();
	init_retry();
	ENV_CMDS_FULL_URI = "AWS_CONTAINER_CREDENTIALS_FULL_URI";
	ENV_CMDS_RELATIVE_URI = "AWS_CONTAINER_CREDENTIALS_RELATIVE_URI";
	ENV_CMDS_AUTH_TOKEN = "AWS_CONTAINER_AUTHORIZATION_TOKEN";
	fromContainerMetadata = (init = {}) => {
		const { timeout, maxRetries } = providerConfigFromInit(init);
		return () => retry(async () => {
			const requestOptions = await getCmdsUri({ logger: init.logger });
			const credsResponse = JSON.parse(await requestFromEcsImds(timeout, requestOptions));
			if (!isImdsCredentials(credsResponse)) throw new CredentialsProviderError("Invalid response received from instance metadata service.", { logger: init.logger });
			return fromImdsCredentials(credsResponse);
		}, maxRetries);
	};
	requestFromEcsImds = async (timeout, options) => {
		if (process.env["AWS_CONTAINER_AUTHORIZATION_TOKEN"]) options.headers = {
			...options.headers,
			Authorization: process.env[ENV_CMDS_AUTH_TOKEN]
		};
		return (await httpRequest({
			...options,
			timeout
		})).toString();
	};
	CMDS_IP = "169.254.170.2";
	GREENGRASS_HOSTS = /* @__PURE__ */ new Set(["localhost", "127.0.0.1"]);
	GREENGRASS_PROTOCOLS = /* @__PURE__ */ new Set(["http:", "https:"]);
	getCmdsUri = async ({ logger }) => {
		if (process.env["AWS_CONTAINER_CREDENTIALS_RELATIVE_URI"]) return {
			hostname: CMDS_IP,
			path: process.env[ENV_CMDS_RELATIVE_URI]
		};
		if (process.env["AWS_CONTAINER_CREDENTIALS_FULL_URI"]) {
			let parsed;
			try {
				parsed = new URL(process.env[ENV_CMDS_FULL_URI]);
			} catch {
				throw new CredentialsProviderError(`${process.env[ENV_CMDS_FULL_URI]} is not a valid container metadata service URL`, {
					tryNextLink: false,
					logger
				});
			}
			if (!parsed.hostname || !GREENGRASS_HOSTS.has(parsed.hostname)) throw new CredentialsProviderError(`${parsed.hostname} is not a valid container metadata service hostname`, {
				tryNextLink: false,
				logger
			});
			if (!parsed.protocol || !GREENGRASS_PROTOCOLS.has(parsed.protocol)) throw new CredentialsProviderError(`${parsed.protocol} is not a valid container metadata service protocol`, {
				tryNextLink: false,
				logger
			});
			return {
				protocol: parsed.protocol,
				hostname: parsed.hostname,
				path: parsed.pathname + parsed.search,
				port: parsed.port ? parseInt(parsed.port, 10) : void 0
			};
		}
		throw new CredentialsProviderError(`The container metadata credential provider cannot be used unless the ${ENV_CMDS_RELATIVE_URI} or ${ENV_CMDS_FULL_URI} environment variable is set`, {
			tryNextLink: false,
			logger
		});
	};
}));
//#endregion
//#region ../../node_modules/@smithy/credential-provider-imds/dist-es/error/InstanceMetadataV1FallbackError.js
var InstanceMetadataV1FallbackError;
var init_InstanceMetadataV1FallbackError = __esmMin((() => {
	init_config$1();
	InstanceMetadataV1FallbackError = class InstanceMetadataV1FallbackError extends CredentialsProviderError {
		tryNextLink;
		name = "InstanceMetadataV1FallbackError";
		constructor(message, tryNextLink = true) {
			super(message, tryNextLink);
			this.tryNextLink = tryNextLink;
			Object.setPrototypeOf(this, InstanceMetadataV1FallbackError.prototype);
		}
	};
}));
//#endregion
//#region ../../node_modules/@smithy/credential-provider-imds/dist-es/config/Endpoint.js
var Endpoint;
var init_Endpoint = __esmMin((() => {
	(function(Endpoint) {
		Endpoint["IPv4"] = "http://169.254.169.254";
		Endpoint["IPv6"] = "http://[fd00:ec2::254]";
	})(Endpoint || (Endpoint = {}));
}));
//#endregion
//#region ../../node_modules/@smithy/credential-provider-imds/dist-es/config/EndpointConfigOptions.js
var ENV_ENDPOINT_NAME, CONFIG_ENDPOINT_NAME, ENDPOINT_CONFIG_OPTIONS;
var init_EndpointConfigOptions = __esmMin((() => {
	ENV_ENDPOINT_NAME = "AWS_EC2_METADATA_SERVICE_ENDPOINT";
	CONFIG_ENDPOINT_NAME = "ec2_metadata_service_endpoint";
	ENDPOINT_CONFIG_OPTIONS = {
		environmentVariableSelector: (env) => env[ENV_ENDPOINT_NAME],
		configFileSelector: (profile) => profile[CONFIG_ENDPOINT_NAME],
		default: void 0
	};
}));
//#endregion
//#region ../../node_modules/@smithy/credential-provider-imds/dist-es/config/EndpointMode.js
var EndpointMode;
var init_EndpointMode = __esmMin((() => {
	(function(EndpointMode) {
		EndpointMode["IPv4"] = "IPv4";
		EndpointMode["IPv6"] = "IPv6";
	})(EndpointMode || (EndpointMode = {}));
}));
//#endregion
//#region ../../node_modules/@smithy/credential-provider-imds/dist-es/config/EndpointModeConfigOptions.js
var ENV_ENDPOINT_MODE_NAME, CONFIG_ENDPOINT_MODE_NAME, ENDPOINT_MODE_CONFIG_OPTIONS;
var init_EndpointModeConfigOptions = __esmMin((() => {
	init_EndpointMode();
	ENV_ENDPOINT_MODE_NAME = "AWS_EC2_METADATA_SERVICE_ENDPOINT_MODE";
	CONFIG_ENDPOINT_MODE_NAME = "ec2_metadata_service_endpoint_mode";
	ENDPOINT_MODE_CONFIG_OPTIONS = {
		environmentVariableSelector: (env) => env[ENV_ENDPOINT_MODE_NAME],
		configFileSelector: (profile) => profile[CONFIG_ENDPOINT_MODE_NAME],
		default: EndpointMode.IPv4
	};
}));
//#endregion
//#region ../../node_modules/@smithy/credential-provider-imds/dist-es/utils/getInstanceMetadataEndpoint.js
var getInstanceMetadataEndpoint, getFromEndpointConfig, getFromEndpointModeConfig;
var init_getInstanceMetadataEndpoint = __esmMin((() => {
	init_config$1();
	init_protocols$1();
	init_Endpoint();
	init_EndpointConfigOptions();
	init_EndpointMode();
	init_EndpointModeConfigOptions();
	getInstanceMetadataEndpoint = async () => parseUrl(await getFromEndpointConfig() || await getFromEndpointModeConfig());
	getFromEndpointConfig = async () => loadConfig(ENDPOINT_CONFIG_OPTIONS)();
	getFromEndpointModeConfig = async () => {
		const endpointMode = await loadConfig(ENDPOINT_MODE_CONFIG_OPTIONS)();
		switch (endpointMode) {
			case EndpointMode.IPv4: return Endpoint.IPv4;
			case EndpointMode.IPv6: return Endpoint.IPv6;
			default: throw new Error(`Unsupported endpoint mode: ${endpointMode}. Select from ${Object.values(EndpointMode)}`);
		}
	};
}));
//#endregion
//#region ../../node_modules/@smithy/credential-provider-imds/dist-es/utils/getExtendedInstanceMetadataCredentials.js
var STATIC_STABILITY_REFRESH_INTERVAL_SECONDS, STATIC_STABILITY_REFRESH_INTERVAL_JITTER_WINDOW_SECONDS, getExtendedInstanceMetadataCredentials;
var init_getExtendedInstanceMetadataCredentials = __esmMin((() => {
	STATIC_STABILITY_REFRESH_INTERVAL_SECONDS = 300;
	STATIC_STABILITY_REFRESH_INTERVAL_JITTER_WINDOW_SECONDS = 300;
	getExtendedInstanceMetadataCredentials = (credentials, logger) => {
		const refreshInterval = STATIC_STABILITY_REFRESH_INTERVAL_SECONDS + Math.floor(Math.random() * STATIC_STABILITY_REFRESH_INTERVAL_JITTER_WINDOW_SECONDS);
		const newExpiration = new Date(Date.now() + refreshInterval * 1e3);
		logger.warn(`Attempting credential expiration extension due to a credential service availability issue. A refresh of these credentials will be attempted after ${new Date(newExpiration)}.\nFor more information, please visit: https://docs.aws.amazon.com/sdkref/latest/guide/feature-static-credentials.html`);
		const originalExpiration = credentials.originalExpiration ?? credentials.expiration;
		return {
			...credentials,
			...originalExpiration ? { originalExpiration } : {},
			expiration: newExpiration
		};
	};
}));
//#endregion
//#region ../../node_modules/@smithy/credential-provider-imds/dist-es/utils/staticStabilityProvider.js
var staticStabilityProvider;
var init_staticStabilityProvider = __esmMin((() => {
	init_getExtendedInstanceMetadataCredentials();
	staticStabilityProvider = (provider, options = {}) => {
		const logger = options?.logger || console;
		let pastCredentials;
		return async () => {
			let credentials;
			try {
				credentials = await provider();
				if (credentials.expiration && credentials.expiration.getTime() < Date.now()) credentials = getExtendedInstanceMetadataCredentials(credentials, logger);
			} catch (e) {
				if (pastCredentials) {
					logger.warn("Credential renew failed: ", e);
					credentials = getExtendedInstanceMetadataCredentials(pastCredentials, logger);
				} else throw e;
			}
			pastCredentials = credentials;
			return credentials;
		};
	};
}));
//#endregion
//#region ../../node_modules/@smithy/credential-provider-imds/dist-es/fromInstanceMetadata.js
var IMDS_PATH, IMDS_TOKEN_PATH, AWS_EC2_METADATA_V1_DISABLED, PROFILE_AWS_EC2_METADATA_V1_DISABLED, X_AWS_EC2_METADATA_TOKEN, fromInstanceMetadata, getInstanceMetadataProvider, getMetadataToken, getProfile, getCredentialsFromProfile;
var init_fromInstanceMetadata = __esmMin((() => {
	init_config$1();
	init_InstanceMetadataV1FallbackError();
	init_ImdsCredentials();
	init_RemoteProviderInit();
	init_httpRequest();
	init_retry();
	init_getInstanceMetadataEndpoint();
	init_staticStabilityProvider();
	IMDS_PATH = "/latest/meta-data/iam/security-credentials/";
	IMDS_TOKEN_PATH = "/latest/api/token";
	AWS_EC2_METADATA_V1_DISABLED = "AWS_EC2_METADATA_V1_DISABLED";
	PROFILE_AWS_EC2_METADATA_V1_DISABLED = "ec2_metadata_v1_disabled";
	X_AWS_EC2_METADATA_TOKEN = "x-aws-ec2-metadata-token";
	fromInstanceMetadata = (init = {}) => staticStabilityProvider(getInstanceMetadataProvider(init), { logger: init.logger });
	getInstanceMetadataProvider = (init = {}) => {
		let disableFetchToken = false;
		const { logger, profile } = init;
		const { timeout, maxRetries } = providerConfigFromInit(init);
		const getCredentials = async (maxRetries, options) => {
			if (disableFetchToken || options.headers?.[X_AWS_EC2_METADATA_TOKEN] == null) {
				let fallbackBlockedFromProfile = false;
				let fallbackBlockedFromProcessEnv = false;
				const configValue = await loadConfig({
					environmentVariableSelector: (env) => {
						const envValue = env[AWS_EC2_METADATA_V1_DISABLED];
						fallbackBlockedFromProcessEnv = !!envValue && envValue !== "false";
						if (envValue === void 0) throw new CredentialsProviderError(`${AWS_EC2_METADATA_V1_DISABLED} not set in env, checking config file next.`, { logger: init.logger });
						return fallbackBlockedFromProcessEnv;
					},
					configFileSelector: (profile) => {
						const profileValue = profile[PROFILE_AWS_EC2_METADATA_V1_DISABLED];
						fallbackBlockedFromProfile = !!profileValue && profileValue !== "false";
						return fallbackBlockedFromProfile;
					},
					default: false
				}, { profile })();
				if (init.ec2MetadataV1Disabled || configValue) {
					const causes = [];
					if (init.ec2MetadataV1Disabled) causes.push("credential provider initialization (runtime option ec2MetadataV1Disabled)");
					if (fallbackBlockedFromProfile) causes.push(`config file profile (${PROFILE_AWS_EC2_METADATA_V1_DISABLED})`);
					if (fallbackBlockedFromProcessEnv) causes.push(`process environment variable (${AWS_EC2_METADATA_V1_DISABLED})`);
					throw new InstanceMetadataV1FallbackError(`AWS EC2 Metadata v1 fallback has been blocked by AWS SDK configuration in the following: [${causes.join(", ")}].`);
				}
			}
			const imdsProfile = (await retry(async () => {
				let profile;
				try {
					profile = await getProfile(options);
				} catch (err) {
					if (err.statusCode === 401) disableFetchToken = false;
					throw err;
				}
				return profile;
			}, maxRetries)).trim();
			return retry(async () => {
				let creds;
				try {
					creds = await getCredentialsFromProfile(imdsProfile, options, init);
				} catch (err) {
					if (err.statusCode === 401) disableFetchToken = false;
					throw err;
				}
				return creds;
			}, maxRetries);
		};
		return async () => {
			const endpoint = await getInstanceMetadataEndpoint();
			if (disableFetchToken) {
				logger?.debug("AWS SDK Instance Metadata", "using v1 fallback (no token fetch)");
				return getCredentials(maxRetries, {
					...endpoint,
					timeout
				});
			} else {
				let token;
				try {
					token = (await getMetadataToken({
						...endpoint,
						timeout
					})).toString();
				} catch (error) {
					if (error?.statusCode === 400) throw Object.assign(error, { message: "EC2 Metadata token request returned error" });
					else if (error.message === "TimeoutError" || [
						403,
						404,
						405
					].includes(error.statusCode)) disableFetchToken = true;
					logger?.debug("AWS SDK Instance Metadata", "using v1 fallback (initial)");
					return getCredentials(maxRetries, {
						...endpoint,
						timeout
					});
				}
				return getCredentials(maxRetries, {
					...endpoint,
					headers: { [X_AWS_EC2_METADATA_TOKEN]: token },
					timeout
				});
			}
		};
	};
	getMetadataToken = async (options) => httpRequest({
		...options,
		path: IMDS_TOKEN_PATH,
		method: "PUT",
		headers: { "x-aws-ec2-metadata-token-ttl-seconds": "21600" }
	});
	getProfile = async (options) => (await httpRequest({
		...options,
		path: IMDS_PATH
	})).toString();
	getCredentialsFromProfile = async (profile, options, init) => {
		const credentialsResponse = JSON.parse((await httpRequest({
			...options,
			path: IMDS_PATH + profile
		})).toString());
		if (!isImdsCredentials(credentialsResponse)) throw new CredentialsProviderError("Invalid response received from instance metadata service.", { logger: init.logger });
		return fromImdsCredentials(credentialsResponse);
	};
}));
//#endregion
//#region ../../node_modules/@smithy/credential-provider-imds/dist-es/index.js
var dist_es_exports$6 = /* @__PURE__ */ __exportAll({
	DEFAULT_MAX_RETRIES: () => 0,
	DEFAULT_TIMEOUT: () => DEFAULT_TIMEOUT,
	ENV_CMDS_AUTH_TOKEN: () => ENV_CMDS_AUTH_TOKEN,
	ENV_CMDS_FULL_URI: () => ENV_CMDS_FULL_URI,
	ENV_CMDS_RELATIVE_URI: () => ENV_CMDS_RELATIVE_URI,
	Endpoint: () => Endpoint,
	fromContainerMetadata: () => fromContainerMetadata,
	fromInstanceMetadata: () => fromInstanceMetadata,
	getInstanceMetadataEndpoint: () => getInstanceMetadataEndpoint,
	httpRequest: () => httpRequest,
	providerConfigFromInit: () => providerConfigFromInit
});
var init_dist_es$8 = __esmMin((() => {
	init_fromContainerMetadata();
	init_fromInstanceMetadata();
	init_RemoteProviderInit();
	init_httpRequest();
	init_getInstanceMetadataEndpoint();
	init_Endpoint();
}));
//#endregion
//#region ../../node_modules/@smithy/node-http-handler/dist-es/build-abort-error.js
function buildAbortError(abortSignal) {
	const reason = abortSignal && typeof abortSignal === "object" && "reason" in abortSignal ? abortSignal.reason : void 0;
	if (reason) {
		if (reason instanceof Error) {
			const abortError = /* @__PURE__ */ new Error("Request aborted");
			abortError.name = "AbortError";
			abortError.cause = reason;
			return abortError;
		}
		const abortError = new Error(String(reason));
		abortError.name = "AbortError";
		return abortError;
	}
	const abortError = /* @__PURE__ */ new Error("Request aborted");
	abortError.name = "AbortError";
	return abortError;
}
var init_build_abort_error = __esmMin((() => {}));
//#endregion
//#region ../../node_modules/@smithy/node-http-handler/dist-es/constants.js
var NODEJS_TIMEOUT_ERROR_CODES;
var init_constants$1 = __esmMin((() => {
	NODEJS_TIMEOUT_ERROR_CODES = [
		"ECONNRESET",
		"EPIPE",
		"ETIMEDOUT"
	];
}));
//#endregion
//#region ../../node_modules/@smithy/node-http-handler/dist-es/get-transformed-headers.js
var getTransformedHeaders;
var init_get_transformed_headers = __esmMin((() => {
	init_serde();
	getTransformedHeaders = (headers) => {
		const transformedHeaders = {};
		for (const name in headers) {
			if (!hasOwn(headers, name)) continue;
			const headerValues = headers[name];
			transformedHeaders[name] = Array.isArray(headerValues) ? headerValues.join(",") : headerValues;
		}
		return transformedHeaders;
	};
}));
//#endregion
//#region ../../node_modules/@smithy/node-http-handler/dist-es/node-https.js
var init_node_https = __esmMin((() => {}));
//#endregion
//#region ../../node_modules/@smithy/node-http-handler/dist-es/timing.js
var timing;
var init_timing = __esmMin((() => {
	timing = {
		setTimeout: (cb, ms) => setTimeout(cb, ms),
		clearTimeout: (timeoutId) => clearTimeout(timeoutId)
	};
}));
//#endregion
//#region ../../node_modules/@smithy/node-http-handler/dist-es/set-connection-timeout.js
var DEFER_EVENT_LISTENER_TIME$2, setConnectionTimeout;
var init_set_connection_timeout = __esmMin((() => {
	init_timing();
	DEFER_EVENT_LISTENER_TIME$2 = 1e3;
	setConnectionTimeout = (request, reject, timeoutInMs = 0) => {
		if (!timeoutInMs) return -1;
		const registerTimeout = (offset) => {
			const timeoutId = timing.setTimeout(() => {
				request.destroy();
				reject(Object.assign(/* @__PURE__ */ new Error(`@smithy/node-http-handler - the request socket did not establish a connection with the server within the configured timeout of ${timeoutInMs} ms.`), { name: "TimeoutError" }));
			}, timeoutInMs - offset);
			const doWithSocket = (socket) => {
				if (socket?.connecting) socket.on("connect", () => {
					timing.clearTimeout(timeoutId);
				});
				else timing.clearTimeout(timeoutId);
			};
			if (request.socket) doWithSocket(request.socket);
			else request.on("socket", doWithSocket);
		};
		if (timeoutInMs < 2e3) {
			registerTimeout(0);
			return 0;
		}
		return timing.setTimeout(registerTimeout.bind(null, DEFER_EVENT_LISTENER_TIME$2), DEFER_EVENT_LISTENER_TIME$2);
	};
}));
//#endregion
//#region ../../node_modules/@smithy/node-http-handler/dist-es/set-request-timeout.js
var setRequestTimeout;
var init_set_request_timeout = __esmMin((() => {
	init_timing();
	setRequestTimeout = (req, reject, timeoutInMs = 0, throwOnRequestTimeout, logger) => {
		if (timeoutInMs) return timing.setTimeout(() => {
			let msg = `@smithy/node-http-handler - [${throwOnRequestTimeout ? "ERROR" : "WARN"}] a request has exceeded the configured ${timeoutInMs} ms requestTimeout.`;
			if (throwOnRequestTimeout) {
				const error = Object.assign(new Error(msg), {
					name: "TimeoutError",
					code: "ETIMEDOUT"
				});
				req.destroy(error);
				reject(error);
			} else {
				msg += ` Init client requestHandler with throwOnRequestTimeout=true to turn this into an error.`;
				logger?.warn?.(msg);
			}
		}, timeoutInMs);
		return -1;
	};
}));
//#endregion
//#region ../../node_modules/@smithy/node-http-handler/dist-es/set-socket-keep-alive.js
var DEFER_EVENT_LISTENER_TIME$1, setSocketKeepAlive;
var init_set_socket_keep_alive = __esmMin((() => {
	init_timing();
	DEFER_EVENT_LISTENER_TIME$1 = 3e3;
	setSocketKeepAlive = (request, { keepAlive, keepAliveMsecs }, deferTimeMs = DEFER_EVENT_LISTENER_TIME$1) => {
		if (keepAlive !== true) return -1;
		const registerListener = () => {
			if (request.socket) request.socket.setKeepAlive(keepAlive, keepAliveMsecs || 0);
			else request.on("socket", (socket) => {
				socket.setKeepAlive(keepAlive, keepAliveMsecs || 0);
			});
		};
		if (deferTimeMs === 0) {
			registerListener();
			return 0;
		}
		return timing.setTimeout(registerListener, deferTimeMs);
	};
}));
//#endregion
//#region ../../node_modules/@smithy/node-http-handler/dist-es/set-socket-timeout.js
var DEFER_EVENT_LISTENER_TIME, setSocketTimeout;
var init_set_socket_timeout = __esmMin((() => {
	init_timing();
	DEFER_EVENT_LISTENER_TIME = 3e3;
	setSocketTimeout = (request, reject, timeoutInMs = 0) => {
		const registerTimeout = (offset) => {
			const timeout = timeoutInMs - offset;
			const onTimeout = () => {
				request.destroy();
				reject(Object.assign(/* @__PURE__ */ new Error(`@smithy/node-http-handler - the request socket timed out after ${timeoutInMs} ms of inactivity (configured by client requestHandler).`), { name: "TimeoutError" }));
			};
			if (request.socket) {
				request.socket.setTimeout(timeout, onTimeout);
				request.on("close", () => request.socket?.removeListener("timeout", onTimeout));
			} else request.setTimeout(timeout, onTimeout);
		};
		if (0 < timeoutInMs && timeoutInMs < 6e3) {
			registerTimeout(0);
			return 0;
		}
		return timing.setTimeout(registerTimeout.bind(null, timeoutInMs === 0 ? 0 : DEFER_EVENT_LISTENER_TIME), DEFER_EVENT_LISTENER_TIME);
	};
}));
//#endregion
//#region ../../node_modules/@smithy/node-http-handler/dist-es/write-request-body.js
async function writeRequestBody(httpRequest, request, maxContinueTimeoutMs = MIN_WAIT_TIME, externalAgent = false) {
	const headers = request.headers;
	const expect = headers ? headers.Expect || headers.expect : void 0;
	let timeoutId = -1;
	let sendBody = true;
	if (!externalAgent && expect === "100-continue") sendBody = await Promise.race([new Promise((resolve) => {
		timeoutId = Number(timing.setTimeout(() => resolve(true), Math.max(MIN_WAIT_TIME, maxContinueTimeoutMs)));
	}), new Promise((resolve) => {
		httpRequest.on("continue", () => {
			timing.clearTimeout(timeoutId);
			resolve(true);
		});
		httpRequest.on("response", () => {
			timing.clearTimeout(timeoutId);
			resolve(false);
		});
		httpRequest.on("error", () => {
			timing.clearTimeout(timeoutId);
			resolve(false);
		});
	})]);
	if (sendBody) writeBody(httpRequest, request.body);
}
function writeBody(httpRequest, body) {
	if (body instanceof Readable) {
		body.pipe(httpRequest);
		return;
	}
	if (body) {
		const isBuffer = Buffer.isBuffer(body);
		if (isBuffer || typeof body === "string") {
			if (isBuffer && body.byteLength === 0) httpRequest.end();
			else httpRequest.end(body);
			return;
		}
		const uint8 = body;
		if (typeof uint8 === "object" && uint8.buffer && typeof uint8.byteOffset === "number" && typeof uint8.byteLength === "number") {
			httpRequest.end(Buffer.from(uint8.buffer, uint8.byteOffset, uint8.byteLength));
			return;
		}
		httpRequest.end(Buffer.from(body));
		return;
	}
	httpRequest.end();
}
var MIN_WAIT_TIME;
var init_write_request_body = __esmMin((() => {
	init_timing();
	MIN_WAIT_TIME = 6e3;
}));
//#endregion
//#region ../../node_modules/@smithy/node-http-handler/dist-es/node-http-handler.js
var hAgent, hRequest, NodeHttpHandler;
var init_node_http_handler = __esmMin((() => {
	init_serde();
	init_protocols$1();
	init_build_abort_error();
	init_constants$1();
	init_get_transformed_headers();
	init_node_https();
	init_set_connection_timeout();
	init_set_request_timeout();
	init_set_socket_keep_alive();
	init_set_socket_timeout();
	init_timing();
	init_write_request_body();
	hAgent = void 0;
	hRequest = void 0;
	NodeHttpHandler = class NodeHttpHandler {
		config;
		configProvider;
		socketWarningTimestamp = 0;
		externalAgent = false;
		metadata = { handlerProtocol: "http/1.1" };
		static create(instanceOrOptions) {
			if (typeof instanceOrOptions?.handle === "function") return instanceOrOptions;
			return new NodeHttpHandler(instanceOrOptions);
		}
		static checkSocketUsage(agent, socketWarningTimestamp, logger = console) {
			const { sockets, requests, maxSockets } = agent;
			if (typeof maxSockets !== "number" || maxSockets === Infinity) return socketWarningTimestamp;
			if (Date.now() - 15e3 < socketWarningTimestamp) return socketWarningTimestamp;
			if (sockets && requests) for (const origin in sockets) {
				if (!hasOwn(sockets, origin)) continue;
				const socketsInUse = sockets[origin]?.length ?? 0;
				const requestsEnqueued = requests[origin]?.length ?? 0;
				if (socketsInUse >= maxSockets && requestsEnqueued >= 2 * maxSockets) {
					logger?.warn?.(`@smithy/node-http-handler:WARN - socket usage at capacity=${socketsInUse} and ${requestsEnqueued} additional requests are enqueued.
See https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/node-configuring-maxsockets.html
or increase socketAcquisitionWarningTimeout=(millis) in the NodeHttpHandler config.`);
					return Date.now();
				}
			}
			return socketWarningTimestamp;
		}
		constructor(options) {
			this.configProvider = new Promise((resolve, reject) => {
				if (typeof options === "function") options().then((_options) => {
					resolve(this.resolveDefaultConfig(_options));
				}).catch(reject);
				else resolve(this.resolveDefaultConfig(options));
			});
		}
		destroy() {
			this.config?.httpAgent?.destroy();
			this.config?.httpsAgent?.destroy();
		}
		async handle(request, { abortSignal, requestTimeout } = {}) {
			if (!this.config) this.config = await this.configProvider;
			const config = this.config;
			const logger = config.logger;
			const isSSL = request.protocol === "https:";
			if (!isSSL && !this.config.httpAgent) this.config.httpAgent = await this.config.httpAgentProvider();
			return new Promise((_resolve, _reject) => {
				let writeRequestBodyPromise = void 0;
				let socketWarningTimeoutId = -1;
				let connectionTimeoutId = -1;
				let requestTimeoutId = -1;
				let socketTimeoutId = -1;
				let keepAliveTimeoutId = -1;
				const clearTimeouts = () => {
					timing.clearTimeout(socketWarningTimeoutId);
					timing.clearTimeout(connectionTimeoutId);
					timing.clearTimeout(requestTimeoutId);
					timing.clearTimeout(socketTimeoutId);
					timing.clearTimeout(keepAliveTimeoutId);
				};
				const resolve = async (arg) => {
					await writeRequestBodyPromise;
					clearTimeouts();
					_resolve(arg);
				};
				const reject = async (arg) => {
					await writeRequestBodyPromise;
					clearTimeouts();
					_reject(arg);
				};
				if (abortSignal?.aborted) {
					reject(buildAbortError(abortSignal));
					return;
				}
				const headers = request.headers;
				const expectContinue = headers ? (headers.Expect ?? headers.expect) === "100-continue" : false;
				let agent = isSSL ? config.httpsAgent : config.httpAgent;
				if (expectContinue && !this.externalAgent) agent = new (isSSL ? node_https.Agent : hAgent)({
					keepAlive: false,
					maxSockets: Infinity
				});
				socketWarningTimeoutId = timing.setTimeout(() => {
					this.socketWarningTimestamp = NodeHttpHandler.checkSocketUsage(agent, this.socketWarningTimestamp, logger);
				}, config.socketAcquisitionWarningTimeout ?? (config.requestTimeout ?? 2e3) + (config.connectionTimeout ?? 1e3));
				const queryString = request.query ? buildQueryString(request.query) : "";
				let auth = void 0;
				if (request.username != null || request.password != null) auth = `${request.username ?? ""}:${request.password ?? ""}`;
				let path = request.path;
				if (queryString) path += `?${queryString}`;
				if (request.fragment) path += `#${request.fragment}`;
				let hostname = request.hostname ?? "";
				if (hostname[0] === "[" && hostname.endsWith("]")) hostname = request.hostname.slice(1, -1);
				else hostname = request.hostname;
				const nodeHttpsOptions = {
					headers: request.headers,
					host: hostname,
					method: request.method,
					path,
					port: request.port,
					agent,
					auth
				};
				const req = (isSSL ? node_https.request : hRequest)(nodeHttpsOptions, (res) => {
					const httpResponse = new HttpResponse({
						statusCode: res.statusCode || -1,
						reason: res.statusMessage,
						headers: getTransformedHeaders(res.headers),
						body: res
					});
					resolve({ response: httpResponse });
				});
				req.on("error", (err) => {
					if (NODEJS_TIMEOUT_ERROR_CODES.includes(err.code)) reject(Object.assign(err, { name: "TimeoutError" }));
					else reject(err);
				});
				if (abortSignal) {
					const onAbort = () => {
						req.destroy();
						const abortError = buildAbortError(abortSignal);
						reject(abortError);
					};
					if (typeof abortSignal.addEventListener === "function") {
						const signal = abortSignal;
						signal.addEventListener("abort", onAbort, { once: true });
						req.once("close", () => signal.removeEventListener("abort", onAbort));
					} else abortSignal.onabort = onAbort;
				}
				const effectiveRequestTimeout = requestTimeout ?? config.requestTimeout;
				connectionTimeoutId = setConnectionTimeout(req, reject, config.connectionTimeout);
				requestTimeoutId = setRequestTimeout(req, reject, effectiveRequestTimeout, config.throwOnRequestTimeout, logger ?? console);
				socketTimeoutId = setSocketTimeout(req, reject, config.socketTimeout);
				const httpAgent = nodeHttpsOptions.agent;
				if (typeof httpAgent === "object" && "keepAlive" in httpAgent) keepAliveTimeoutId = setSocketKeepAlive(req, {
					keepAlive: httpAgent.keepAlive,
					keepAliveMsecs: httpAgent.keepAliveMsecs
				});
				writeRequestBodyPromise = writeRequestBody(req, request, effectiveRequestTimeout, this.externalAgent).catch((e) => {
					clearTimeouts();
					return _reject(e);
				});
			});
		}
		updateHttpClientConfig(key, value) {
			this.config = void 0;
			this.configProvider = this.configProvider.then((config) => {
				if (key === Symbol.for("logger")) return {
					...config,
					logger: config.logger ?? value
				};
				return {
					...config,
					[key]: value
				};
			});
		}
		httpHandlerConfigs() {
			return this.config ?? {};
		}
		resolveDefaultConfig(options) {
			const { requestTimeout, connectionTimeout, socketTimeout, socketAcquisitionWarningTimeout, httpAgent, httpsAgent, throwOnRequestTimeout, logger } = options || {};
			const keepAlive = true;
			const maxSockets = 50;
			return {
				connectionTimeout,
				requestTimeout,
				socketTimeout,
				socketAcquisitionWarningTimeout,
				throwOnRequestTimeout,
				httpAgentProvider: async () => {
					const node_http = await import("node:http");
					const { Agent, request } = node_http.default ?? node_http;
					hRequest = request;
					hAgent = Agent;
					if (httpAgent instanceof hAgent || typeof httpAgent?.destroy === "function") {
						this.externalAgent = true;
						return httpAgent;
					}
					return new hAgent({
						keepAlive,
						maxSockets,
						...httpAgent
					});
				},
				httpsAgent: (() => {
					if (httpsAgent instanceof node_https.Agent || typeof httpsAgent?.destroy === "function") {
						this.externalAgent = true;
						return httpsAgent;
					}
					return new node_https.Agent({
						keepAlive,
						maxSockets,
						...httpsAgent
					});
				})(),
				logger
			};
		}
	};
}));
//#endregion
//#region ../../node_modules/@smithy/node-http-handler/dist-es/index.js
var init_dist_es$7 = __esmMin((() => {
	init_node_http_handler();
	init_protocols$1();
	init_get_transformed_headers();
	init_write_request_body();
	init_serde();
}));
//#endregion
//#region ../../node_modules/@aws-sdk/credential-provider-http/dist-es/fromHttp/checkUrl.js
var ECS_CONTAINER_HOST, EKS_CONTAINER_HOST_IPv4, EKS_CONTAINER_HOST_IPv6, checkUrl;
var init_checkUrl = __esmMin((() => {
	init_config$1();
	ECS_CONTAINER_HOST = "169.254.170.2";
	EKS_CONTAINER_HOST_IPv4 = "169.254.170.23";
	EKS_CONTAINER_HOST_IPv6 = "[fd00:ec2::23]";
	checkUrl = (url, logger) => {
		if (url.protocol === "https:") return;
		if (url.hostname === ECS_CONTAINER_HOST || url.hostname === EKS_CONTAINER_HOST_IPv4 || url.hostname === EKS_CONTAINER_HOST_IPv6) return;
		if (url.hostname.includes("[")) {
			if (url.hostname === "[::1]" || url.hostname === "[0000:0000:0000:0000:0000:0000:0000:0001]") return;
		} else {
			if (url.hostname === "localhost") return;
			const ipComponents = url.hostname.split(".");
			const inRange = (component) => {
				const num = parseInt(component, 10);
				return 0 <= num && num <= 255;
			};
			if (ipComponents[0] === "127" && inRange(ipComponents[1]) && inRange(ipComponents[2]) && inRange(ipComponents[3]) && ipComponents.length === 4) return;
		}
		throw new CredentialsProviderError(`URL not accepted. It must either be HTTPS or match one of the following:
  - loopback CIDR 127.0.0.0/8 or [::1/128]
  - ECS container host 169.254.170.2
  - EKS container host 169.254.170.23 or [fd00:ec2::23]`, { logger });
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/credential-provider-http/dist-es/fromHttp/requestHelpers.js
function createGetRequest(url) {
	return new HttpRequest({
		protocol: url.protocol,
		hostname: url.hostname,
		port: Number(url.port),
		path: url.pathname,
		query: Array.from(url.searchParams.entries()).reduce((acc, [k, v]) => {
			acc[k] = v;
			return acc;
		}, {}),
		fragment: url.hash
	});
}
async function getCredentials(response, logger) {
	const str = await sdkStreamMixin(response.body).transformToString();
	if (response.statusCode === 200) {
		const parsed = JSON.parse(str);
		if (typeof parsed.AccessKeyId !== "string" || typeof parsed.SecretAccessKey !== "string" || typeof parsed.Token !== "string" || typeof parsed.Expiration !== "string") throw new CredentialsProviderError("HTTP credential provider response not of the required format, an object matching: { AccessKeyId: string, SecretAccessKey: string, Token: string, Expiration: string(rfc3339) }", { logger });
		return {
			accessKeyId: parsed.AccessKeyId,
			secretAccessKey: parsed.SecretAccessKey,
			sessionToken: parsed.Token,
			expiration: parseRfc3339DateTime(parsed.Expiration)
		};
	}
	if (response.statusCode >= 400 && response.statusCode < 500) {
		let parsedBody = {};
		try {
			parsedBody = JSON.parse(str);
		} catch (e) {}
		throw Object.assign(new CredentialsProviderError(`Server responded with status: ${response.statusCode}`, { logger }), {
			Code: parsedBody.Code,
			Message: parsedBody.Message
		});
	}
	throw new CredentialsProviderError(`Server responded with status: ${response.statusCode}`, { logger });
}
var init_requestHelpers = __esmMin((() => {
	init_config$1();
	init_protocols$1();
	init_serde();
}));
//#endregion
//#region ../../node_modules/@aws-sdk/credential-provider-http/dist-es/fromHttp/retry-wrapper.js
var retryWrapper;
var init_retry_wrapper = __esmMin((() => {
	retryWrapper = (toRetry, maxRetries, delayMs) => {
		return async () => {
			for (let i = 0; i < maxRetries; ++i) try {
				return await toRetry();
			} catch (e) {
				await new Promise((resolve) => setTimeout(resolve, delayMs));
			}
			return await toRetry();
		};
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/credential-provider-http/dist-es/fromHttp/fromHttp.js
var AWS_CONTAINER_CREDENTIALS_RELATIVE_URI, DEFAULT_LINK_LOCAL_HOST, AWS_CONTAINER_CREDENTIALS_FULL_URI, AWS_CONTAINER_AUTHORIZATION_TOKEN_FILE, AWS_CONTAINER_AUTHORIZATION_TOKEN, fromHttp, validateToken;
var init_fromHttp = __esmMin((() => {
	init_client();
	init_config$1();
	init_dist_es$7();
	init_checkUrl();
	init_requestHelpers();
	init_retry_wrapper();
	AWS_CONTAINER_CREDENTIALS_RELATIVE_URI = "AWS_CONTAINER_CREDENTIALS_RELATIVE_URI";
	DEFAULT_LINK_LOCAL_HOST = "http://169.254.170.2";
	AWS_CONTAINER_CREDENTIALS_FULL_URI = "AWS_CONTAINER_CREDENTIALS_FULL_URI";
	AWS_CONTAINER_AUTHORIZATION_TOKEN_FILE = "AWS_CONTAINER_AUTHORIZATION_TOKEN_FILE";
	AWS_CONTAINER_AUTHORIZATION_TOKEN = "AWS_CONTAINER_AUTHORIZATION_TOKEN";
	fromHttp = (options = {}) => {
		options.logger?.debug("@aws-sdk/credential-provider-http - fromHttp");
		let host;
		const relative = options.awsContainerCredentialsRelativeUri ?? process.env[AWS_CONTAINER_CREDENTIALS_RELATIVE_URI];
		const full = options.awsContainerCredentialsFullUri ?? process.env[AWS_CONTAINER_CREDENTIALS_FULL_URI];
		const token = options.awsContainerAuthorizationToken ?? process.env[AWS_CONTAINER_AUTHORIZATION_TOKEN];
		const tokenFile = options.awsContainerAuthorizationTokenFile ?? process.env[AWS_CONTAINER_AUTHORIZATION_TOKEN_FILE];
		const warn = options.logger?.constructor?.name === "NoOpLogger" || !options.logger?.warn ? console.warn : options.logger.warn.bind(options.logger);
		if (relative && full) {
			warn("@aws-sdk/credential-provider-http: you have set both awsContainerCredentialsRelativeUri and awsContainerCredentialsFullUri.");
			warn("awsContainerCredentialsRelativeUri will take precedence.");
		}
		if (token && tokenFile) {
			warn("@aws-sdk/credential-provider-http: you have set both awsContainerAuthorizationToken and awsContainerAuthorizationTokenFile.");
			warn("awsContainerAuthorizationTokenFile will take precedence.");
		}
		if (relative) host = `${DEFAULT_LINK_LOCAL_HOST}${relative}`;
		else if (full) host = full;
		else throw new CredentialsProviderError(`No HTTP credential provider host provided.
Set AWS_CONTAINER_CREDENTIALS_FULL_URI or AWS_CONTAINER_CREDENTIALS_RELATIVE_URI.`, { logger: options.logger });
		const url = new URL(host);
		checkUrl(url, options.logger);
		const requestHandler = NodeHttpHandler.create({ connectionTimeout: options.timeout ?? 1e3 });
		const requestTimeout = options.timeout ?? 1e3;
		const provider = retryWrapper(async () => {
			const request = createGetRequest(url);
			if (tokenFile) request.headers.Authorization = validateToken((await fs.readFile(tokenFile)).toString());
			else if (token) request.headers.Authorization = validateToken(token);
			try {
				return getCredentials((await requestHandler.handle(request, { requestTimeout })).response).then((creds) => setCredentialFeature(creds, "CREDENTIALS_HTTP", "z"));
			} catch (e) {
				throw new CredentialsProviderError(String(e), { logger: options.logger });
			}
		}, options.maxRetries ?? 3, options.timeout ?? 1e3);
		return async () => {
			try {
				return await provider();
			} finally {
				requestHandler.destroy?.();
			}
		};
	};
	validateToken = (token) => {
		if (token.includes("\r\n")) throw new CredentialsProviderError("Authorization token contains invalid \\r\\n sequence.");
		return token;
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/credential-provider-http/dist-es/index.js
var dist_es_exports$5 = /* @__PURE__ */ __exportAll({ fromHttp: () => fromHttp });
var init_dist_es$6 = __esmMin((() => {
	init_fromHttp();
}));
//#endregion
//#region ../../node_modules/@aws-sdk/credential-provider-node/dist-es/remoteProvider.js
init_config$1();
var remoteProvider = async (init) => {
	const { ENV_CMDS_FULL_URI, ENV_CMDS_RELATIVE_URI, fromContainerMetadata, fromInstanceMetadata } = await Promise.resolve().then(() => (init_dist_es$8(), dist_es_exports$6));
	if (process.env[ENV_CMDS_RELATIVE_URI] || process.env[ENV_CMDS_FULL_URI]) {
		init.logger?.debug("@aws-sdk/credential-provider-node - remoteProvider::fromHttp/fromContainerMetadata");
		const { fromHttp } = await Promise.resolve().then(() => (init_dist_es$6(), dist_es_exports$5));
		return chain(fromHttp(init), fromContainerMetadata(init));
	}
	if (process.env["AWS_EC2_METADATA_DISABLED"] && process.env["AWS_EC2_METADATA_DISABLED"] !== "false") return async () => {
		throw new CredentialsProviderError("EC2 Instance Metadata Service access disabled", { logger: init.logger });
	};
	init.logger?.debug("@aws-sdk/credential-provider-node - remoteProvider::fromInstanceMetadata");
	return fromInstanceMetadata(init);
};
//#endregion
//#region ../../node_modules/@aws-sdk/credential-provider-node/dist-es/runtime/memoize-chain.js
function memoizeChain(providers, treatAsExpired) {
	const chain = internalCreateChain(providers);
	let activeLock;
	let passiveLock;
	let credentials;
	let forceRefreshLock;
	const provider = async (options) => {
		if (options?.forceRefresh) {
			if (!forceRefreshLock) forceRefreshLock = chain(options).then((c) => {
				credentials = c;
			}).finally(() => {
				forceRefreshLock = void 0;
			});
			await forceRefreshLock;
			return credentials;
		}
		if (credentials?.expiration) {
			if (credentials?.expiration?.getTime() < Date.now()) credentials = void 0;
		}
		if (activeLock) await activeLock;
		else if (!credentials || treatAsExpired?.(credentials)) {
			if (credentials) {
				if (!passiveLock) passiveLock = chain(options).then((c) => {
					credentials = c;
				}).catch(() => {}).finally(() => {
					passiveLock = void 0;
				});
			} else {
				activeLock = chain(options).then((c) => {
					credentials = c;
				}).finally(() => {
					activeLock = void 0;
				});
				return provider(options);
			}
		}
		return credentials;
	};
	return provider;
}
var internalCreateChain = (providers) => async (awsIdentityProperties) => {
	let lastProviderError;
	for (const provider of providers) try {
		return await provider(awsIdentityProperties);
	} catch (err) {
		lastProviderError = err;
		if (err?.tryNextLink) continue;
		throw err;
	}
	throw lastProviderError;
};
//#endregion
//#region ../../node_modules/@aws-sdk/credential-provider-sso/dist-es/isSsoProfile.js
var isSsoProfile$1;
var init_isSsoProfile = __esmMin((() => {
	isSsoProfile$1 = (arg) => arg && (typeof arg.sso_start_url === "string" || typeof arg.sso_account_id === "string" || typeof arg.sso_session === "string" || typeof arg.sso_region === "string" || typeof arg.sso_role_name === "string");
})), REFRESH_MESSAGE;
var init_constants = __esmMin((() => {
	REFRESH_MESSAGE = `To refresh this SSO session run 'aws sso login' with the corresponding profile.`;
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso-oidc/auth/httpAuthSchemeProvider.js
function createAwsAuthSigv4HttpAuthOption$3(authParameters) {
	return {
		schemeId: "aws.auth#sigv4",
		signingProperties: {
			name: "sso-oauth",
			region: authParameters.region
		},
		propertiesExtractor: (config, context) => ({ signingProperties: {
			config,
			context
		} })
	};
}
function createSmithyApiNoAuthHttpAuthOption$3(authParameters) {
	return { schemeId: "smithy.api#noAuth" };
}
var defaultSSOOIDCHttpAuthSchemeParametersProvider, defaultSSOOIDCHttpAuthSchemeProvider, resolveHttpAuthSchemeConfig$3;
var init_httpAuthSchemeProvider$3 = __esmMin((() => {
	init_httpAuthSchemes();
	init_client$1();
	defaultSSOOIDCHttpAuthSchemeParametersProvider = async (config, context, input) => {
		return {
			operation: getSmithyContext(context).operation,
			region: await normalizeProvider$1(config.region)() || (() => {
				throw new Error("expected `region` to be configured for `aws.auth#sigv4`");
			})()
		};
	};
	defaultSSOOIDCHttpAuthSchemeProvider = (authParameters) => {
		const options = [];
		switch (authParameters.operation) {
			case "CreateToken":
				options.push(createSmithyApiNoAuthHttpAuthOption$3(authParameters));
				break;
			default: options.push(createAwsAuthSigv4HttpAuthOption$3(authParameters));
		}
		return options;
	};
	resolveHttpAuthSchemeConfig$3 = (config) => {
		const config_0 = resolveAwsSdkSigV4Config(config);
		return Object.assign(config_0, { authSchemePreference: normalizeProvider$1(config.authSchemePreference ?? []) });
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso-oidc/endpoint/EndpointParameters.js
var resolveClientEndpointParameters$3, commonParams$3;
var init_EndpointParameters$3 = __esmMin((() => {
	resolveClientEndpointParameters$3 = (options) => {
		return Object.assign(options, {
			useDualstackEndpoint: options.useDualstackEndpoint ?? false,
			useFipsEndpoint: options.useFipsEndpoint ?? false,
			defaultSigningName: "sso-oauth"
		});
	};
	commonParams$3 = {
		UseFIPS: {
			type: "builtInParams",
			name: "useFipsEndpoint"
		},
		Endpoint: {
			type: "builtInParams",
			name: "endpoint"
		},
		Region: {
			type: "builtInParams",
			name: "region"
		},
		UseDualStack: {
			type: "builtInParams",
			name: "useDualstackEndpoint"
		}
	};
})), name, version, description, homepage, license, author, repository, files, main, module, browser, types, typesVersions, exports, scripts, dependencies, devDependencies, engines, package_default;
var init_package = __esmMin((() => {
	name = "@aws-sdk/nested-clients";
	version = "3.997.46";
	description = "Nested clients for AWS SDK packages.";
	homepage = "https://github.com/aws/aws-sdk-js-v3/tree/main/packages/nested-clients";
	license = "Apache-2.0";
	author = {
		"name": "AWS SDK for JavaScript Team",
		"url": "https://aws.amazon.com/sdk-for-javascript/"
	};
	repository = {
		"type": "git",
		"url": "https://github.com/aws/aws-sdk-js-v3.git",
		"directory": "packages/nested-clients"
	};
	files = [
		"./cognito-identity.d.ts",
		"./cognito-identity.js",
		"./signin.d.ts",
		"./signin.js",
		"./sso-oidc.d.ts",
		"./sso-oidc.js",
		"./sso.d.ts",
		"./sso.js",
		"./sts.d.ts",
		"./sts.js",
		"dist-*/**"
	];
	main = "./dist-cjs/index.js";
	module = "./dist-es/index.js";
	browser = {
		"./dist-es/submodules/cognito-identity/runtimeConfig": "./dist-es/submodules/cognito-identity/runtimeConfig.browser",
		"./dist-es/submodules/signin/runtimeConfig": "./dist-es/submodules/signin/runtimeConfig.browser",
		"./dist-es/submodules/sso-oidc/runtimeConfig": "./dist-es/submodules/sso-oidc/runtimeConfig.browser",
		"./dist-es/submodules/sso/runtimeConfig": "./dist-es/submodules/sso/runtimeConfig.browser",
		"./dist-es/submodules/sts/runtimeConfig": "./dist-es/submodules/sts/runtimeConfig.browser"
	};
	types = "./dist-types/index.d.ts";
	typesVersions = { "<4.5": {
		"dist-types/*": ["dist-types/ts3.4/*"],
		"*": ["dist-types/ts3.4/submodules/*/index.d.ts"]
	} };
	exports = {
		"./package.json": "./package.json",
		"./sso-oidc": {
			"types": "./dist-types/submodules/sso-oidc/index.d.ts",
			"module": "./dist-es/submodules/sso-oidc/index.js",
			"node": "./dist-cjs/submodules/sso-oidc/index.js",
			"import": "./dist-es/submodules/sso-oidc/index.js",
			"require": "./dist-cjs/submodules/sso-oidc/index.js"
		},
		"./sts": {
			"types": "./dist-types/submodules/sts/index.d.ts",
			"module": "./dist-es/submodules/sts/index.js",
			"node": "./dist-cjs/submodules/sts/index.js",
			"import": "./dist-es/submodules/sts/index.js",
			"require": "./dist-cjs/submodules/sts/index.js"
		},
		"./signin": {
			"types": "./dist-types/submodules/signin/index.d.ts",
			"module": "./dist-es/submodules/signin/index.js",
			"node": "./dist-cjs/submodules/signin/index.js",
			"import": "./dist-es/submodules/signin/index.js",
			"require": "./dist-cjs/submodules/signin/index.js"
		},
		"./cognito-identity": {
			"types": "./dist-types/submodules/cognito-identity/index.d.ts",
			"module": "./dist-es/submodules/cognito-identity/index.js",
			"node": "./dist-cjs/submodules/cognito-identity/index.js",
			"import": "./dist-es/submodules/cognito-identity/index.js",
			"require": "./dist-cjs/submodules/cognito-identity/index.js"
		},
		"./sso": {
			"types": "./dist-types/submodules/sso/index.d.ts",
			"module": "./dist-es/submodules/sso/index.js",
			"node": "./dist-cjs/submodules/sso/index.js",
			"import": "./dist-es/submodules/sso/index.js",
			"require": "./dist-cjs/submodules/sso/index.js"
		}
	};
	scripts = {
		"build": "concurrently 'yarn:build:types' 'yarn:build:es' && yarn build:cjs",
		"build:cjs": "node ../../scripts/compilation/inline",
		"build:es": "premove dist-es && tsc -p tsconfig.es.json",
		"build:include:deps": "yarn g:turbo run build -F=\"$npm_package_name\"",
		"build:types": "premove dist-types && tsc -p tsconfig.types.json",
		"build:types:downlevel": "downlevel-dts dist-types dist-types/ts3.4",
		"clean": "premove dist-cjs dist-es dist-types",
		"lint": "node ../../scripts/validation/submodules-linter.js",
		"prebuild": "yarn lint",
		"test": "yarn g:vitest run",
		"test:watch": "yarn g:vitest watch"
	};
	dependencies = {
		"@aws-sdk/core": "^3.978.1",
		"@aws-sdk/signature-v4-multi-region": "^3.996.47",
		"@aws-sdk/types": "^3.974.6",
		"@smithy/core": "^3.35.0",
		"@smithy/fetch-http-handler": "^5.8.0",
		"@smithy/node-http-handler": "^4.12.1",
		"@smithy/types": "^4.19.0",
		"tslib": "^2.6.2"
	};
	devDependencies = {
		"concurrently": "7.0.0",
		"downlevel-dts": "0.10.1",
		"premove": "4.0.0",
		"typescript": "~7.0.2"
	};
	engines = { "node": ">=20.0.0" };
	package_default = {
		name,
		version,
		description,
		homepage,
		license,
		author,
		repository,
		files,
		sideEffects: false,
		main,
		module,
		browser,
		types,
		typesVersions,
		"react-native": {},
		exports,
		scripts,
		dependencies,
		devDependencies,
		engines
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso-oidc/endpoint/bdd.js
var k$3, a$3, b$3, c$3, d$3, e$3, f$3, g$3, h$3, i$3, j$3, _data$3, root$3, nodes$3, bdd$3;
var init_bdd$3 = __esmMin((() => {
	init_endpoints();
	k$3 = "ref";
	a$3 = -1;
	b$3 = true;
	c$3 = "isSet";
	d$3 = "PartitionResult";
	e$3 = "booleanEquals";
	f$3 = "getAttr";
	g$3 = { [k$3]: "Endpoint" };
	h$3 = { [k$3]: d$3 };
	i$3 = {};
	j$3 = [{ [k$3]: "Region" }];
	_data$3 = {
		conditions: [
			[c$3, [g$3]],
			[c$3, j$3],
			[
				"aws.partition",
				j$3,
				d$3
			],
			[e$3, [{ [k$3]: "UseFIPS" }, b$3]],
			[e$3, [{ [k$3]: "UseDualStack" }, b$3]],
			[e$3, [{
				fn: f$3,
				argv: [h$3, "supportsDualStack"]
			}, b$3]],
			[e$3, [{
				fn: f$3,
				argv: [h$3, "supportsFIPS"]
			}, b$3]],
			["stringEquals", [{
				fn: f$3,
				argv: [h$3, "name"]
			}, "aws-us-gov"]]
		],
		results: [
			[a$3],
			[a$3, "Invalid Configuration: FIPS and custom endpoint are not supported"],
			[a$3, "Invalid Configuration: Dualstack and custom endpoint are not supported"],
			[g$3, i$3],
			["https://oidc-fips.{Region}.{PartitionResult#dualStackDnsSuffix}", i$3],
			[a$3, "FIPS and DualStack are enabled, but this partition does not support one or both"],
			["https://oidc.{Region}.amazonaws.com", i$3],
			["https://oidc-fips.{Region}.{PartitionResult#dnsSuffix}", i$3],
			[a$3, "FIPS is enabled but this partition does not support FIPS"],
			["https://oidc.{Region}.{PartitionResult#dualStackDnsSuffix}", i$3],
			[a$3, "DualStack is enabled but this partition does not support DualStack"],
			["https://oidc.{Region}.{PartitionResult#dnsSuffix}", i$3],
			[a$3, "Invalid Configuration: Missing Region"]
		]
	};
	root$3 = 2;
	nodes$3 = new Int32Array([
		-1,
		1,
		-1,
		0,
		13,
		3,
		1,
		4,
		100000012,
		2,
		5,
		100000012,
		3,
		8,
		6,
		4,
		7,
		100000011,
		5,
		100000009,
		100000010,
		4,
		11,
		9,
		6,
		10,
		100000008,
		7,
		100000006,
		100000007,
		5,
		12,
		100000005,
		6,
		100000004,
		100000005,
		3,
		100000001,
		14,
		4,
		100000002,
		100000003
	]);
	bdd$3 = BinaryDecisionDiagram.from(nodes$3, root$3, _data$3.conditions, _data$3.results);
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso-oidc/endpoint/endpointResolver.js
var cache$3, defaultEndpointResolver$3;
var init_endpointResolver$3 = __esmMin((() => {
	init_client();
	init_endpoints();
	init_bdd$3();
	cache$3 = new EndpointCache({
		size: 50,
		params: [
			"Endpoint",
			"Region",
			"UseDualStack",
			"UseFIPS"
		]
	});
	defaultEndpointResolver$3 = (endpointParams, context = {}) => {
		return cache$3.get(endpointParams, () => decideEndpoint(bdd$3, {
			endpointParams,
			logger: context.logger
		}));
	};
	customEndpointFunctions.aws = awsEndpointFunctions;
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso-oidc/models/SSOOIDCServiceException.js
var SSOOIDCServiceException;
var init_SSOOIDCServiceException = __esmMin((() => {
	init_client$1();
	SSOOIDCServiceException = class SSOOIDCServiceException extends ServiceException {
		constructor(options) {
			super(options);
			Object.setPrototypeOf(this, SSOOIDCServiceException.prototype);
		}
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso-oidc/models/errors.js
var AccessDeniedException$1, AuthorizationPendingException, ExpiredTokenException$1, InternalServerException$1, InvalidClientException, InvalidGrantException, InvalidRequestException$1, InvalidScopeException, SlowDownException, UnauthorizedClientException, UnsupportedGrantTypeException;
var init_errors$3 = __esmMin((() => {
	init_SSOOIDCServiceException();
	AccessDeniedException$1 = class AccessDeniedException$1 extends SSOOIDCServiceException {
		name = "AccessDeniedException";
		$fault = "client";
		error;
		reason;
		error_description;
		constructor(opts) {
			super({
				name: "AccessDeniedException",
				$fault: "client",
				...opts
			});
			Object.setPrototypeOf(this, AccessDeniedException$1.prototype);
			this.error = opts.error;
			this.reason = opts.reason;
			this.error_description = opts.error_description;
		}
	};
	AuthorizationPendingException = class AuthorizationPendingException extends SSOOIDCServiceException {
		name = "AuthorizationPendingException";
		$fault = "client";
		error;
		error_description;
		constructor(opts) {
			super({
				name: "AuthorizationPendingException",
				$fault: "client",
				...opts
			});
			Object.setPrototypeOf(this, AuthorizationPendingException.prototype);
			this.error = opts.error;
			this.error_description = opts.error_description;
		}
	};
	ExpiredTokenException$1 = class ExpiredTokenException$1 extends SSOOIDCServiceException {
		name = "ExpiredTokenException";
		$fault = "client";
		error;
		error_description;
		constructor(opts) {
			super({
				name: "ExpiredTokenException",
				$fault: "client",
				...opts
			});
			Object.setPrototypeOf(this, ExpiredTokenException$1.prototype);
			this.error = opts.error;
			this.error_description = opts.error_description;
		}
	};
	InternalServerException$1 = class InternalServerException$1 extends SSOOIDCServiceException {
		name = "InternalServerException";
		$fault = "server";
		error;
		error_description;
		constructor(opts) {
			super({
				name: "InternalServerException",
				$fault: "server",
				...opts
			});
			Object.setPrototypeOf(this, InternalServerException$1.prototype);
			this.error = opts.error;
			this.error_description = opts.error_description;
		}
	};
	InvalidClientException = class InvalidClientException extends SSOOIDCServiceException {
		name = "InvalidClientException";
		$fault = "client";
		error;
		error_description;
		constructor(opts) {
			super({
				name: "InvalidClientException",
				$fault: "client",
				...opts
			});
			Object.setPrototypeOf(this, InvalidClientException.prototype);
			this.error = opts.error;
			this.error_description = opts.error_description;
		}
	};
	InvalidGrantException = class InvalidGrantException extends SSOOIDCServiceException {
		name = "InvalidGrantException";
		$fault = "client";
		error;
		error_description;
		constructor(opts) {
			super({
				name: "InvalidGrantException",
				$fault: "client",
				...opts
			});
			Object.setPrototypeOf(this, InvalidGrantException.prototype);
			this.error = opts.error;
			this.error_description = opts.error_description;
		}
	};
	InvalidRequestException$1 = class InvalidRequestException$1 extends SSOOIDCServiceException {
		name = "InvalidRequestException";
		$fault = "client";
		error;
		reason;
		error_description;
		constructor(opts) {
			super({
				name: "InvalidRequestException",
				$fault: "client",
				...opts
			});
			Object.setPrototypeOf(this, InvalidRequestException$1.prototype);
			this.error = opts.error;
			this.reason = opts.reason;
			this.error_description = opts.error_description;
		}
	};
	InvalidScopeException = class InvalidScopeException extends SSOOIDCServiceException {
		name = "InvalidScopeException";
		$fault = "client";
		error;
		error_description;
		constructor(opts) {
			super({
				name: "InvalidScopeException",
				$fault: "client",
				...opts
			});
			Object.setPrototypeOf(this, InvalidScopeException.prototype);
			this.error = opts.error;
			this.error_description = opts.error_description;
		}
	};
	SlowDownException = class SlowDownException extends SSOOIDCServiceException {
		name = "SlowDownException";
		$fault = "client";
		error;
		error_description;
		constructor(opts) {
			super({
				name: "SlowDownException",
				$fault: "client",
				...opts
			});
			Object.setPrototypeOf(this, SlowDownException.prototype);
			this.error = opts.error;
			this.error_description = opts.error_description;
		}
	};
	UnauthorizedClientException = class UnauthorizedClientException extends SSOOIDCServiceException {
		name = "UnauthorizedClientException";
		$fault = "client";
		error;
		error_description;
		constructor(opts) {
			super({
				name: "UnauthorizedClientException",
				$fault: "client",
				...opts
			});
			Object.setPrototypeOf(this, UnauthorizedClientException.prototype);
			this.error = opts.error;
			this.error_description = opts.error_description;
		}
	};
	UnsupportedGrantTypeException = class UnsupportedGrantTypeException extends SSOOIDCServiceException {
		name = "UnsupportedGrantTypeException";
		$fault = "client";
		error;
		error_description;
		constructor(opts) {
			super({
				name: "UnsupportedGrantTypeException",
				$fault: "client",
				...opts
			});
			Object.setPrototypeOf(this, UnsupportedGrantTypeException.prototype);
			this.error = opts.error;
			this.error_description = opts.error_description;
		}
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso-oidc/schemas/schemas_0.js
var _ADE$1, _APE, _AT$1, _CS, _CT, _CTR, _CTRr, _CV, _ETE$1, _ICE, _IGE, _IRE$1, _ISE$1, _ISEn, _IT, _RT$1, _SDE, _UCE, _UGTE, _aT$2, _c$3, _cI$1, _cS, _cV$1, _co$1, _dC, _e$3, _eI$1, _ed, _gT$1, _h$2, _hE$3, _iT$1, _r$1, _rT$1, _rU$1, _s$3, _sc, _se$1, _tT$1, n0$3, _s_registry$3, SSOOIDCServiceException$, n0_registry$3, AccessDeniedException$$1, AuthorizationPendingException$, ExpiredTokenException$$1, InternalServerException$$1, InvalidClientException$, InvalidGrantException$, InvalidRequestException$$1, InvalidScopeException$, SlowDownException$, UnauthorizedClientException$, UnsupportedGrantTypeException$, errorTypeRegistries$3, AccessToken, ClientSecret, CodeVerifier, IdToken, RefreshToken$1, CreateTokenRequest$, CreateTokenResponse$, CreateToken$;
var init_schemas_0$3 = __esmMin((() => {
	init_schema();
	init_errors$3();
	init_SSOOIDCServiceException();
	_ADE$1 = "AccessDeniedException";
	_APE = "AuthorizationPendingException";
	_AT$1 = "AccessToken";
	_CS = "ClientSecret";
	_CT = "CreateToken";
	_CTR = "CreateTokenRequest";
	_CTRr = "CreateTokenResponse";
	_CV = "CodeVerifier";
	_ETE$1 = "ExpiredTokenException";
	_ICE = "InvalidClientException";
	_IGE = "InvalidGrantException";
	_IRE$1 = "InvalidRequestException";
	_ISE$1 = "InternalServerException";
	_ISEn = "InvalidScopeException";
	_IT = "IdToken";
	_RT$1 = "RefreshToken";
	_SDE = "SlowDownException";
	_UCE = "UnauthorizedClientException";
	_UGTE = "UnsupportedGrantTypeException";
	_aT$2 = "accessToken";
	_c$3 = "client";
	_cI$1 = "clientId";
	_cS = "clientSecret";
	_cV$1 = "codeVerifier";
	_co$1 = "code";
	_dC = "deviceCode";
	_e$3 = "error";
	_eI$1 = "expiresIn";
	_ed = "error_description";
	_gT$1 = "grantType";
	_h$2 = "http";
	_hE$3 = "httpError";
	_iT$1 = "idToken";
	_r$1 = "reason";
	_rT$1 = "refreshToken";
	_rU$1 = "redirectUri";
	_s$3 = "smithy.ts.sdk.synthetic.com.amazonaws.ssooidc";
	_sc = "scope";
	_se$1 = "server";
	_tT$1 = "tokenType";
	n0$3 = "com.amazonaws.ssooidc";
	_s_registry$3 = new TypeRegistry(_s$3);
	SSOOIDCServiceException$ = [
		-3,
		_s$3,
		"SSOOIDCServiceException",
		0,
		[],
		[]
	];
	_s_registry$3.registerError(SSOOIDCServiceException$, SSOOIDCServiceException);
	n0_registry$3 = new TypeRegistry(n0$3);
	AccessDeniedException$$1 = [
		-3,
		n0$3,
		_ADE$1,
		{
			[_e$3]: _c$3,
			[_hE$3]: 400
		},
		[
			_e$3,
			_r$1,
			_ed
		],
		[
			0,
			0,
			0
		]
	];
	n0_registry$3.registerError(AccessDeniedException$$1, AccessDeniedException$1);
	AuthorizationPendingException$ = [
		-3,
		n0$3,
		_APE,
		{
			[_e$3]: _c$3,
			[_hE$3]: 400
		},
		[_e$3, _ed],
		[0, 0]
	];
	n0_registry$3.registerError(AuthorizationPendingException$, AuthorizationPendingException);
	ExpiredTokenException$$1 = [
		-3,
		n0$3,
		_ETE$1,
		{
			[_e$3]: _c$3,
			[_hE$3]: 400
		},
		[_e$3, _ed],
		[0, 0]
	];
	n0_registry$3.registerError(ExpiredTokenException$$1, ExpiredTokenException$1);
	InternalServerException$$1 = [
		-3,
		n0$3,
		_ISE$1,
		{
			[_e$3]: _se$1,
			[_hE$3]: 500
		},
		[_e$3, _ed],
		[0, 0]
	];
	n0_registry$3.registerError(InternalServerException$$1, InternalServerException$1);
	InvalidClientException$ = [
		-3,
		n0$3,
		_ICE,
		{
			[_e$3]: _c$3,
			[_hE$3]: 401
		},
		[_e$3, _ed],
		[0, 0]
	];
	n0_registry$3.registerError(InvalidClientException$, InvalidClientException);
	InvalidGrantException$ = [
		-3,
		n0$3,
		_IGE,
		{
			[_e$3]: _c$3,
			[_hE$3]: 400
		},
		[_e$3, _ed],
		[0, 0]
	];
	n0_registry$3.registerError(InvalidGrantException$, InvalidGrantException);
	InvalidRequestException$$1 = [
		-3,
		n0$3,
		_IRE$1,
		{
			[_e$3]: _c$3,
			[_hE$3]: 400
		},
		[
			_e$3,
			_r$1,
			_ed
		],
		[
			0,
			0,
			0
		]
	];
	n0_registry$3.registerError(InvalidRequestException$$1, InvalidRequestException$1);
	InvalidScopeException$ = [
		-3,
		n0$3,
		_ISEn,
		{
			[_e$3]: _c$3,
			[_hE$3]: 400
		},
		[_e$3, _ed],
		[0, 0]
	];
	n0_registry$3.registerError(InvalidScopeException$, InvalidScopeException);
	SlowDownException$ = [
		-3,
		n0$3,
		_SDE,
		{
			[_e$3]: _c$3,
			[_hE$3]: 400
		},
		[_e$3, _ed],
		[0, 0]
	];
	n0_registry$3.registerError(SlowDownException$, SlowDownException);
	UnauthorizedClientException$ = [
		-3,
		n0$3,
		_UCE,
		{
			[_e$3]: _c$3,
			[_hE$3]: 400
		},
		[_e$3, _ed],
		[0, 0]
	];
	n0_registry$3.registerError(UnauthorizedClientException$, UnauthorizedClientException);
	UnsupportedGrantTypeException$ = [
		-3,
		n0$3,
		_UGTE,
		{
			[_e$3]: _c$3,
			[_hE$3]: 400
		},
		[_e$3, _ed],
		[0, 0]
	];
	n0_registry$3.registerError(UnsupportedGrantTypeException$, UnsupportedGrantTypeException);
	errorTypeRegistries$3 = [_s_registry$3, n0_registry$3];
	AccessToken = [
		0,
		n0$3,
		_AT$1,
		8,
		0
	];
	ClientSecret = [
		0,
		n0$3,
		_CS,
		8,
		0
	];
	CodeVerifier = [
		0,
		n0$3,
		_CV,
		8,
		0
	];
	IdToken = [
		0,
		n0$3,
		_IT,
		8,
		0
	];
	RefreshToken$1 = [
		0,
		n0$3,
		_RT$1,
		8,
		0
	];
	CreateTokenRequest$ = [
		3,
		n0$3,
		_CTR,
		0,
		[
			_cI$1,
			_cS,
			_gT$1,
			_dC,
			_co$1,
			_rT$1,
			_sc,
			_rU$1,
			_cV$1
		],
		[
			0,
			[() => ClientSecret, 0],
			0,
			0,
			0,
			[() => RefreshToken$1, 0],
			64,
			0,
			[() => CodeVerifier, 0]
		],
		3
	];
	CreateTokenResponse$ = [
		3,
		n0$3,
		_CTRr,
		0,
		[
			_aT$2,
			_tT$1,
			_eI$1,
			_rT$1,
			_iT$1
		],
		[
			[() => AccessToken, 0],
			0,
			1,
			[() => RefreshToken$1, 0],
			[() => IdToken, 0]
		]
	];
	CreateToken$ = [
		9,
		n0$3,
		_CT,
		{ [_h$2]: [
			"POST",
			"/token",
			200
		] },
		() => CreateTokenRequest$,
		() => CreateTokenResponse$
	];
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso-oidc/runtimeConfig.shared.js
var getRuntimeConfig$9;
var init_runtimeConfig_shared$3 = __esmMin((() => {
	init_httpAuthSchemes();
	init_protocols();
	init_dist_es$13();
	init_checksum();
	init_client$1();
	init_protocols$1();
	init_serde();
	init_httpAuthSchemeProvider$3();
	init_endpointResolver$3();
	init_schemas_0$3();
	getRuntimeConfig$9 = (config) => {
		return {
			apiVersion: "2019-06-10",
			base64Decoder: config?.base64Decoder ?? fromBase64,
			base64Encoder: config?.base64Encoder ?? toBase64$1,
			disableHostPrefix: config?.disableHostPrefix ?? false,
			endpointProvider: config?.endpointProvider ?? defaultEndpointResolver$3,
			extensions: config?.extensions ?? [],
			httpAuthSchemeProvider: config?.httpAuthSchemeProvider ?? defaultSSOOIDCHttpAuthSchemeProvider,
			httpAuthSchemes: config?.httpAuthSchemes ?? [{
				schemeId: "aws.auth#sigv4",
				identityProvider: (ipc) => ipc.getIdentityProvider("aws.auth#sigv4"),
				signer: new AwsSdkSigV4Signer()
			}, {
				schemeId: "smithy.api#noAuth",
				identityProvider: (ipc) => ipc.getIdentityProvider("smithy.api#noAuth") || (async () => ({})),
				signer: new NoAuthSigner()
			}],
			logger: config?.logger ?? new NoOpLogger(),
			protocol: config?.protocol ?? AwsRestJsonProtocol,
			protocolSettings: config?.protocolSettings ?? {
				defaultNamespace: "com.amazonaws.ssooidc",
				errorTypeRegistries: errorTypeRegistries$3,
				version: "2019-06-10",
				serviceTarget: "AWSSSOOIDCService"
			},
			serviceId: config?.serviceId ?? "SSO OIDC",
			sha256: config?.sha256 ?? Sha256Node,
			urlParser: config?.urlParser ?? parseUrl,
			utf8Decoder: config?.utf8Decoder ?? fromUtf8$1,
			utf8Encoder: config?.utf8Encoder ?? toUtf8$1
		};
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso-oidc/runtimeConfig.js
var getRuntimeConfig$8;
var init_runtimeConfig$3 = __esmMin((() => {
	init_package();
	init_client();
	init_httpAuthSchemes();
	init_client$1();
	init_config$1();
	init_retry$1();
	init_serde();
	init_dist_es$7();
	init_runtimeConfig_shared$3();
	getRuntimeConfig$8 = (config) => {
		emitWarningIfUnsupportedVersion(process.version);
		const defaultsMode = resolveDefaultsModeConfig(config);
		const defaultConfigProvider = () => defaultsMode().then(loadConfigsForDefaultMode);
		const clientSharedValues = getRuntimeConfig$9(config);
		emitWarningIfUnsupportedVersion$1(process.version);
		const loaderConfig = {
			profile: config?.profile,
			logger: clientSharedValues.logger
		};
		return {
			...clientSharedValues,
			...config,
			runtime: "node",
			defaultsMode,
			authSchemePreference: config?.authSchemePreference ?? loadConfig(NODE_AUTH_SCHEME_PREFERENCE_OPTIONS, loaderConfig),
			bodyLengthChecker: config?.bodyLengthChecker ?? calculateBodyLength,
			defaultUserAgentProvider: config?.defaultUserAgentProvider ?? createDefaultUserAgentProvider({
				serviceId: clientSharedValues.serviceId,
				clientVersion: package_default.version
			}),
			maxAttempts: config?.maxAttempts ?? loadConfig(NODE_MAX_ATTEMPT_CONFIG_OPTIONS, config),
			region: config?.region ?? loadConfig(NODE_REGION_CONFIG_OPTIONS, {
				...NODE_REGION_CONFIG_FILE_OPTIONS,
				...loaderConfig
			}),
			requestHandler: NodeHttpHandler.create(config?.requestHandler ?? defaultConfigProvider),
			retryMode: config?.retryMode ?? loadConfig({
				...NODE_RETRY_MODE_CONFIG_OPTIONS,
				default: async () => (await defaultConfigProvider()).retryMode || DEFAULT_RETRY_MODE
			}, config),
			streamCollector: config?.streamCollector ?? streamCollector,
			useDualstackEndpoint: config?.useDualstackEndpoint ?? loadConfig(NODE_USE_DUALSTACK_ENDPOINT_CONFIG_OPTIONS, loaderConfig),
			useFipsEndpoint: config?.useFipsEndpoint ?? loadConfig(NODE_USE_FIPS_ENDPOINT_CONFIG_OPTIONS, loaderConfig),
			userAgentAppId: config?.userAgentAppId ?? loadConfig(NODE_APP_ID_CONFIG_OPTIONS, loaderConfig)
		};
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso-oidc/auth/httpAuthExtensionConfiguration.js
var getHttpAuthExtensionConfiguration$4, resolveHttpAuthRuntimeConfig$4;
var init_httpAuthExtensionConfiguration$3 = __esmMin((() => {
	getHttpAuthExtensionConfiguration$4 = (runtimeConfig) => {
		const _httpAuthSchemes = runtimeConfig.httpAuthSchemes;
		let _httpAuthSchemeProvider = runtimeConfig.httpAuthSchemeProvider;
		let _credentials = runtimeConfig.credentials;
		return {
			setHttpAuthScheme(httpAuthScheme) {
				const index = _httpAuthSchemes.findIndex((scheme) => scheme.schemeId === httpAuthScheme.schemeId);
				if (index === -1) _httpAuthSchemes.push(httpAuthScheme);
				else _httpAuthSchemes.splice(index, 1, httpAuthScheme);
			},
			httpAuthSchemes() {
				return _httpAuthSchemes;
			},
			setHttpAuthSchemeProvider(httpAuthSchemeProvider) {
				_httpAuthSchemeProvider = httpAuthSchemeProvider;
			},
			httpAuthSchemeProvider() {
				return _httpAuthSchemeProvider;
			},
			setCredentials(credentials) {
				_credentials = credentials;
			},
			credentials() {
				return _credentials;
			}
		};
	};
	resolveHttpAuthRuntimeConfig$4 = (config) => {
		return {
			httpAuthSchemes: config.httpAuthSchemes(),
			httpAuthSchemeProvider: config.httpAuthSchemeProvider(),
			credentials: config.credentials()
		};
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso-oidc/runtimeExtensions.js
var resolveRuntimeExtensions$4;
var init_runtimeExtensions$3 = __esmMin((() => {
	init_client();
	init_client$1();
	init_protocols$1();
	init_httpAuthExtensionConfiguration$3();
	resolveRuntimeExtensions$4 = (runtimeConfig, extensions) => {
		const extensionConfiguration = Object.assign(getAwsRegionExtensionConfiguration(runtimeConfig), getDefaultExtensionConfiguration(runtimeConfig), getHttpHandlerExtensionConfiguration(runtimeConfig), getHttpAuthExtensionConfiguration$4(runtimeConfig));
		extensions.forEach((extension) => extension.configure(extensionConfiguration));
		return Object.assign(runtimeConfig, resolveAwsRegionExtensionConfiguration(extensionConfiguration), resolveDefaultRuntimeConfig(extensionConfiguration), resolveHttpHandlerRuntimeConfig(extensionConfiguration), resolveHttpAuthRuntimeConfig$4(extensionConfiguration));
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso-oidc/SSOOIDCClient.js
var SSOOIDCClient;
var init_SSOOIDCClient = __esmMin((() => {
	init_client();
	init_dist_es$13();
	init_client$1();
	init_config$1();
	init_endpoints();
	init_protocols$1();
	init_retry$1();
	init_schema();
	init_httpAuthSchemeProvider$3();
	init_EndpointParameters$3();
	init_runtimeConfig$3();
	init_runtimeExtensions$3();
	SSOOIDCClient = class extends Client {
		config;
		constructor(...[configuration]) {
			const _config_0 = getRuntimeConfig$8(configuration || {});
			super(_config_0);
			this.initConfig = _config_0;
			const _config_2 = resolveUserAgentConfig(resolveClientEndpointParameters$3(_config_0));
			const _config_3 = resolveRetryConfig(_config_2);
			const _config_5 = resolveHostHeaderConfig(resolveRegionConfig(_config_3));
			const _config_6 = resolveEndpointConfig(_config_5);
			const _config_7 = resolveHttpAuthSchemeConfig$3(_config_6);
			const _config_8 = resolveRuntimeExtensions$4(_config_7, configuration?.extensions || []);
			this.config = _config_8;
			this.middlewareStack.use(getSchemaSerdePlugin(this.config));
			this.middlewareStack.use(getUserAgentPlugin(this.config));
			this.middlewareStack.use(getRetryPlugin(this.config));
			this.middlewareStack.use(getContentLengthPlugin(this.config));
			this.middlewareStack.use(getHostHeaderPlugin(this.config));
			this.middlewareStack.use(getLoggerPlugin(this.config));
			this.middlewareStack.use(getRecursionDetectionPlugin(this.config));
			this.middlewareStack.use(getHttpAuthSchemeEndpointRuleSetPlugin(this.config, {
				httpAuthSchemeParametersProvider: defaultSSOOIDCHttpAuthSchemeParametersProvider,
				identityProviderConfigProvider: async (config) => new DefaultIdentityProviderConfig({ "aws.auth#sigv4": config.credentials })
			}));
			this.middlewareStack.use(getHttpSigningPlugin(this.config));
		}
		destroy() {
			super.destroy();
		}
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso-oidc/commandBuilder.js
var command$3, _ep0$3, _mw0$3;
var init_commandBuilder$3 = __esmMin((() => {
	init_client$1();
	init_endpoints();
	init_EndpointParameters$3();
	command$3 = makeBuilder(commonParams$3, "AWSSSOOIDCService", "SSOOIDCClient", getEndpointPlugin);
	_ep0$3 = {};
	_mw0$3 = (Command, cs, config, o) => [];
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso-oidc/commands/CreateTokenCommand.js
var CreateTokenCommand;
var init_CreateTokenCommand = __esmMin((() => {
	init_commandBuilder$3();
	init_schemas_0$3();
	CreateTokenCommand = class extends command$3(_ep0$3, _mw0$3, "CreateToken", CreateToken$) {};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso-oidc/SSOOIDC.js
var commands$2, SSOOIDC;
var init_SSOOIDC = __esmMin((() => {
	init_client$1();
	init_CreateTokenCommand();
	init_SSOOIDCClient();
	commands$2 = { CreateTokenCommand };
	SSOOIDC = class extends SSOOIDCClient {};
	createAggregatedClient(commands$2, SSOOIDC);
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso-oidc/commands/index.js
var init_commands$3 = __esmMin((() => {
	init_CreateTokenCommand();
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso-oidc/models/enums.js
var AccessDeniedExceptionReason, InvalidRequestExceptionReason;
var init_enums$1 = __esmMin((() => {
	AccessDeniedExceptionReason = { KMS_ACCESS_DENIED: "KMS_AccessDeniedException" };
	InvalidRequestExceptionReason = {
		KMS_DISABLED_KEY: "KMS_DisabledException",
		KMS_INVALID_KEY_USAGE: "KMS_InvalidKeyUsageException",
		KMS_INVALID_STATE: "KMS_InvalidStateException",
		KMS_KEY_NOT_FOUND: "KMS_NotFoundException"
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso-oidc/models/models_0.js
var init_models_0$3 = __esmMin((() => {}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso-oidc/index.js
var sso_oidc_exports = /* @__PURE__ */ __exportAll({
	$Command: () => Command,
	AccessDeniedException: () => AccessDeniedException$1,
	AccessDeniedException$: () => AccessDeniedException$$1,
	AccessDeniedExceptionReason: () => AccessDeniedExceptionReason,
	AuthorizationPendingException: () => AuthorizationPendingException,
	AuthorizationPendingException$: () => AuthorizationPendingException$,
	CreateToken$: () => CreateToken$,
	CreateTokenCommand: () => CreateTokenCommand,
	CreateTokenRequest$: () => CreateTokenRequest$,
	CreateTokenResponse$: () => CreateTokenResponse$,
	ExpiredTokenException: () => ExpiredTokenException$1,
	ExpiredTokenException$: () => ExpiredTokenException$$1,
	InternalServerException: () => InternalServerException$1,
	InternalServerException$: () => InternalServerException$$1,
	InvalidClientException: () => InvalidClientException,
	InvalidClientException$: () => InvalidClientException$,
	InvalidGrantException: () => InvalidGrantException,
	InvalidGrantException$: () => InvalidGrantException$,
	InvalidRequestException: () => InvalidRequestException$1,
	InvalidRequestException$: () => InvalidRequestException$$1,
	InvalidRequestExceptionReason: () => InvalidRequestExceptionReason,
	InvalidScopeException: () => InvalidScopeException,
	InvalidScopeException$: () => InvalidScopeException$,
	SSOOIDC: () => SSOOIDC,
	SSOOIDCClient: () => SSOOIDCClient,
	SSOOIDCServiceException: () => SSOOIDCServiceException,
	SSOOIDCServiceException$: () => SSOOIDCServiceException$,
	SlowDownException: () => SlowDownException,
	SlowDownException$: () => SlowDownException$,
	UnauthorizedClientException: () => UnauthorizedClientException,
	UnauthorizedClientException$: () => UnauthorizedClientException$,
	UnsupportedGrantTypeException: () => UnsupportedGrantTypeException,
	UnsupportedGrantTypeException$: () => UnsupportedGrantTypeException$,
	__Client: () => Client,
	errorTypeRegistries: () => errorTypeRegistries$3
});
var init_sso_oidc = __esmMin((() => {
	init_SSOOIDCClient();
	init_SSOOIDC();
	init_commands$3();
	init_client$1();
	init_schemas_0$3();
	init_enums$1();
	init_errors$3();
	init_models_0$3();
	init_SSOOIDCServiceException();
}));
//#endregion
//#region ../../node_modules/@aws-sdk/token-providers/dist-es/getSsoOidcClient.js
var getSsoOidcClient;
var init_getSsoOidcClient = __esmMin((() => {
	getSsoOidcClient = async (ssoRegion, init = {}, callerClientConfig) => {
		const { SSOOIDCClient } = await Promise.resolve().then(() => (init_sso_oidc(), sso_oidc_exports));
		const coalesce = (prop) => init.clientConfig?.[prop] ?? init.parentClientConfig?.[prop] ?? callerClientConfig?.[prop];
		return new SSOOIDCClient(Object.assign({}, init.clientConfig ?? {}, {
			region: ssoRegion ?? init.clientConfig?.region,
			logger: coalesce("logger"),
			userAgentAppId: coalesce("userAgentAppId")
		}));
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/token-providers/dist-es/getNewSsoOidcToken.js
var getNewSsoOidcToken;
var init_getNewSsoOidcToken = __esmMin((() => {
	init_getSsoOidcClient();
	getNewSsoOidcToken = async (ssoToken, ssoRegion, init = {}, callerClientConfig) => {
		const { CreateTokenCommand } = await Promise.resolve().then(() => (init_sso_oidc(), sso_oidc_exports));
		return (await getSsoOidcClient(ssoRegion, init, callerClientConfig)).send(new CreateTokenCommand({
			clientId: ssoToken.clientId,
			clientSecret: ssoToken.clientSecret,
			refreshToken: ssoToken.refreshToken,
			grantType: "refresh_token"
		}));
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/token-providers/dist-es/validateTokenExpiry.js
var validateTokenExpiry;
var init_validateTokenExpiry = __esmMin((() => {
	init_config$1();
	init_constants();
	validateTokenExpiry = (token) => {
		if (token.expiration && token.expiration.getTime() < Date.now()) throw new TokenProviderError(`Token is expired. ${REFRESH_MESSAGE}`, false);
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/token-providers/dist-es/validateTokenKey.js
var validateTokenKey;
var init_validateTokenKey = __esmMin((() => {
	init_config$1();
	init_constants();
	validateTokenKey = (key, value, forRefresh = false) => {
		if (typeof value === "undefined") throw new TokenProviderError(`Value not present for '${key}' in SSO Token${forRefresh ? ". Cannot refresh" : ""}. ${REFRESH_MESSAGE}`, false);
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/token-providers/dist-es/writeSSOTokenToFile.js
var writeFile, writeSSOTokenToFile;
var init_writeSSOTokenToFile = __esmMin((() => {
	init_config$1();
	({writeFile} = promises);
	writeSSOTokenToFile = (id, ssoToken) => {
		const tokenFilepath = getSSOTokenFilepath(id);
		const tokenString = JSON.stringify(ssoToken, null, 2);
		return writeFile(tokenFilepath, tokenString);
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/token-providers/dist-es/fromSso.js
var lastRefreshAttemptTimes, fromSso;
var init_fromSso = __esmMin((() => {
	init_config$1();
	init_constants();
	init_getNewSsoOidcToken();
	init_validateTokenExpiry();
	init_validateTokenKey();
	init_writeSSOTokenToFile();
	lastRefreshAttemptTimes = /* @__PURE__ */ new Map();
	fromSso = (init = {}) => async ({ callerClientConfig } = {}) => {
		init.logger?.debug("@aws-sdk/token-providers - fromSso");
		const profiles = await parseKnownFiles(init);
		const profileName = getProfileName({ profile: init.profile ?? callerClientConfig?.profile });
		const profile = profiles[profileName];
		if (!profile) throw new TokenProviderError(`Profile '${profileName}' could not be found in shared credentials file.`, false);
		else if (!profile["sso_session"]) throw new TokenProviderError(`Profile '${profileName}' is missing required property 'sso_session'.`);
		const ssoSessionName = profile["sso_session"];
		const ssoSession = (await loadSsoSessionData(init))[ssoSessionName];
		if (!ssoSession) throw new TokenProviderError(`Sso session '${ssoSessionName}' could not be found in shared credentials file.`, false);
		for (const ssoSessionRequiredKey of ["sso_start_url", "sso_region"]) if (!ssoSession[ssoSessionRequiredKey]) throw new TokenProviderError(`Sso session '${ssoSessionName}' is missing required property '${ssoSessionRequiredKey}'.`, false);
		ssoSession["sso_start_url"];
		const ssoRegion = ssoSession["sso_region"];
		let ssoToken;
		try {
			ssoToken = await getSSOTokenFromFile(ssoSessionName);
		} catch (e) {
			throw new TokenProviderError(`The SSO session token associated with profile=${profileName} was not found or is invalid. ${REFRESH_MESSAGE}`, false);
		}
		validateTokenKey("accessToken", ssoToken.accessToken);
		validateTokenKey("expiresAt", ssoToken.expiresAt);
		const { accessToken, expiresAt } = ssoToken;
		const existingToken = {
			token: accessToken,
			expiration: new Date(expiresAt)
		};
		if (existingToken.expiration.getTime() - Date.now() > 3e5) return existingToken;
		const lastRefreshAttemptTime = lastRefreshAttemptTimes.get(ssoSessionName) ?? 0;
		if (Date.now() - lastRefreshAttemptTime < 3e4) {
			validateTokenExpiry(existingToken);
			return existingToken;
		}
		validateTokenKey("clientId", ssoToken.clientId, true);
		validateTokenKey("clientSecret", ssoToken.clientSecret, true);
		validateTokenKey("refreshToken", ssoToken.refreshToken, true);
		try {
			lastRefreshAttemptTimes.set(ssoSessionName, Date.now());
			const newSsoOidcToken = await getNewSsoOidcToken(ssoToken, ssoRegion, init, callerClientConfig);
			validateTokenKey("accessToken", newSsoOidcToken.accessToken);
			validateTokenKey("expiresIn", newSsoOidcToken.expiresIn);
			const newTokenExpiration = new Date(Date.now() + newSsoOidcToken.expiresIn * 1e3);
			try {
				await writeSSOTokenToFile(ssoSessionName, {
					...ssoToken,
					accessToken: newSsoOidcToken.accessToken,
					expiresAt: newTokenExpiration.toISOString(),
					refreshToken: newSsoOidcToken.refreshToken
				});
			} catch (error) {}
			return {
				token: newSsoOidcToken.accessToken,
				expiration: newTokenExpiration
			};
		} catch (error) {
			validateTokenExpiry(existingToken);
			return existingToken;
		}
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/token-providers/dist-es/index.js
var init_dist_es$5 = __esmMin((() => {
	init_client();
	init_httpAuthSchemes();
	init_config$1();
	init_fromSso();
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso/auth/httpAuthSchemeProvider.js
function createAwsAuthSigv4HttpAuthOption$2(authParameters) {
	return {
		schemeId: "aws.auth#sigv4",
		signingProperties: {
			name: "awsssoportal",
			region: authParameters.region
		},
		propertiesExtractor: (config, context) => ({ signingProperties: {
			config,
			context
		} })
	};
}
function createSmithyApiNoAuthHttpAuthOption$2(authParameters) {
	return { schemeId: "smithy.api#noAuth" };
}
var defaultSSOHttpAuthSchemeParametersProvider, defaultSSOHttpAuthSchemeProvider, resolveHttpAuthSchemeConfig$2;
var init_httpAuthSchemeProvider$2 = __esmMin((() => {
	init_httpAuthSchemes();
	init_client$1();
	defaultSSOHttpAuthSchemeParametersProvider = async (config, context, input) => {
		return {
			operation: getSmithyContext(context).operation,
			region: await normalizeProvider$1(config.region)() || (() => {
				throw new Error("expected `region` to be configured for `aws.auth#sigv4`");
			})()
		};
	};
	defaultSSOHttpAuthSchemeProvider = (authParameters) => {
		const options = [];
		switch (authParameters.operation) {
			case "GetRoleCredentials":
				options.push(createSmithyApiNoAuthHttpAuthOption$2(authParameters));
				break;
			default: options.push(createAwsAuthSigv4HttpAuthOption$2(authParameters));
		}
		return options;
	};
	resolveHttpAuthSchemeConfig$2 = (config) => {
		const config_0 = resolveAwsSdkSigV4Config(config);
		return Object.assign(config_0, { authSchemePreference: normalizeProvider$1(config.authSchemePreference ?? []) });
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso/endpoint/EndpointParameters.js
var resolveClientEndpointParameters$2, commonParams$2;
var init_EndpointParameters$2 = __esmMin((() => {
	resolveClientEndpointParameters$2 = (options) => {
		return Object.assign(options, {
			useDualstackEndpoint: options.useDualstackEndpoint ?? false,
			useFipsEndpoint: options.useFipsEndpoint ?? false,
			defaultSigningName: "awsssoportal"
		});
	};
	commonParams$2 = {
		UseFIPS: {
			type: "builtInParams",
			name: "useFipsEndpoint"
		},
		Endpoint: {
			type: "builtInParams",
			name: "endpoint"
		},
		Region: {
			type: "builtInParams",
			name: "region"
		},
		UseDualStack: {
			type: "builtInParams",
			name: "useDualstackEndpoint"
		}
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso/endpoint/bdd.js
var k$2, a$2, b$2, c$2, d$2, e$2, f$2, g$2, h$2, i$2, j$2, _data$2, root$2, nodes$2, bdd$2;
var init_bdd$2 = __esmMin((() => {
	init_endpoints();
	k$2 = "ref";
	a$2 = -1;
	b$2 = true;
	c$2 = "isSet";
	d$2 = "PartitionResult";
	e$2 = "booleanEquals";
	f$2 = "getAttr";
	g$2 = { [k$2]: "Endpoint" };
	h$2 = { [k$2]: d$2 };
	i$2 = {};
	j$2 = [{ [k$2]: "Region" }];
	_data$2 = {
		conditions: [
			[c$2, [g$2]],
			[c$2, j$2],
			[
				"aws.partition",
				j$2,
				d$2
			],
			[e$2, [{ [k$2]: "UseFIPS" }, b$2]],
			[e$2, [{ [k$2]: "UseDualStack" }, b$2]],
			[e$2, [{
				fn: f$2,
				argv: [h$2, "supportsDualStack"]
			}, b$2]],
			[e$2, [{
				fn: f$2,
				argv: [h$2, "supportsFIPS"]
			}, b$2]],
			["stringEquals", [{
				fn: f$2,
				argv: [h$2, "name"]
			}, "aws-us-gov"]]
		],
		results: [
			[a$2],
			[a$2, "Invalid Configuration: FIPS and custom endpoint are not supported"],
			[a$2, "Invalid Configuration: Dualstack and custom endpoint are not supported"],
			[g$2, i$2],
			["https://portal.sso-fips.{Region}.{PartitionResult#dualStackDnsSuffix}", i$2],
			[a$2, "FIPS and DualStack are enabled, but this partition does not support one or both"],
			["https://portal.sso.{Region}.amazonaws.com", i$2],
			["https://portal.sso-fips.{Region}.{PartitionResult#dnsSuffix}", i$2],
			[a$2, "FIPS is enabled but this partition does not support FIPS"],
			["https://portal.sso.{Region}.{PartitionResult#dualStackDnsSuffix}", i$2],
			[a$2, "DualStack is enabled but this partition does not support DualStack"],
			["https://portal.sso.{Region}.{PartitionResult#dnsSuffix}", i$2],
			[a$2, "Invalid Configuration: Missing Region"]
		]
	};
	root$2 = 2;
	nodes$2 = new Int32Array([
		-1,
		1,
		-1,
		0,
		13,
		3,
		1,
		4,
		100000012,
		2,
		5,
		100000012,
		3,
		8,
		6,
		4,
		7,
		100000011,
		5,
		100000009,
		100000010,
		4,
		11,
		9,
		6,
		10,
		100000008,
		7,
		100000006,
		100000007,
		5,
		12,
		100000005,
		6,
		100000004,
		100000005,
		3,
		100000001,
		14,
		4,
		100000002,
		100000003
	]);
	bdd$2 = BinaryDecisionDiagram.from(nodes$2, root$2, _data$2.conditions, _data$2.results);
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso/endpoint/endpointResolver.js
var cache$2, defaultEndpointResolver$2;
var init_endpointResolver$2 = __esmMin((() => {
	init_client();
	init_endpoints();
	init_bdd$2();
	cache$2 = new EndpointCache({
		size: 50,
		params: [
			"Endpoint",
			"Region",
			"UseDualStack",
			"UseFIPS"
		]
	});
	defaultEndpointResolver$2 = (endpointParams, context = {}) => {
		return cache$2.get(endpointParams, () => decideEndpoint(bdd$2, {
			endpointParams,
			logger: context.logger
		}));
	};
	customEndpointFunctions.aws = awsEndpointFunctions;
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso/models/SSOServiceException.js
var SSOServiceException;
var init_SSOServiceException = __esmMin((() => {
	init_client$1();
	SSOServiceException = class SSOServiceException extends ServiceException {
		constructor(options) {
			super(options);
			Object.setPrototypeOf(this, SSOServiceException.prototype);
		}
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso/models/errors.js
var InvalidRequestException, ResourceNotFoundException, TooManyRequestsException, UnauthorizedException;
var init_errors$2 = __esmMin((() => {
	init_SSOServiceException();
	InvalidRequestException = class InvalidRequestException extends SSOServiceException {
		name = "InvalidRequestException";
		$fault = "client";
		constructor(opts) {
			super({
				name: "InvalidRequestException",
				$fault: "client",
				...opts
			});
			Object.setPrototypeOf(this, InvalidRequestException.prototype);
		}
	};
	ResourceNotFoundException = class ResourceNotFoundException extends SSOServiceException {
		name = "ResourceNotFoundException";
		$fault = "client";
		constructor(opts) {
			super({
				name: "ResourceNotFoundException",
				$fault: "client",
				...opts
			});
			Object.setPrototypeOf(this, ResourceNotFoundException.prototype);
		}
	};
	TooManyRequestsException = class TooManyRequestsException extends SSOServiceException {
		name = "TooManyRequestsException";
		$fault = "client";
		constructor(opts) {
			super({
				name: "TooManyRequestsException",
				$fault: "client",
				...opts
			});
			Object.setPrototypeOf(this, TooManyRequestsException.prototype);
		}
	};
	UnauthorizedException = class UnauthorizedException extends SSOServiceException {
		name = "UnauthorizedException";
		$fault = "client";
		constructor(opts) {
			super({
				name: "UnauthorizedException",
				$fault: "client",
				...opts
			});
			Object.setPrototypeOf(this, UnauthorizedException.prototype);
		}
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso/schemas/schemas_0.js
var _ATT, _GRC, _GRCR, _GRCRe, _IRE, _RC, _RNFE, _SAKT, _STT, _TMRE$1, _UE, _aI, _aKI$1, _aT$1, _ai, _c$2, _e$2, _ex, _h$1, _hE$2, _hH, _hQ, _m$2, _rC, _rN, _rn, _s$2, _sAK$1, _sT$1, _xasbt, n0$2, _s_registry$2, SSOServiceException$, n0_registry$2, InvalidRequestException$, ResourceNotFoundException$, TooManyRequestsException$, UnauthorizedException$, errorTypeRegistries$2, AccessTokenType, SecretAccessKeyType, SessionTokenType, GetRoleCredentialsRequest$, GetRoleCredentialsResponse$, RoleCredentials$, GetRoleCredentials$;
var init_schemas_0$2 = __esmMin((() => {
	init_schema();
	init_errors$2();
	init_SSOServiceException();
	_ATT = "AccessTokenType";
	_GRC = "GetRoleCredentials";
	_GRCR = "GetRoleCredentialsRequest";
	_GRCRe = "GetRoleCredentialsResponse";
	_IRE = "InvalidRequestException";
	_RC = "RoleCredentials";
	_RNFE = "ResourceNotFoundException";
	_SAKT = "SecretAccessKeyType";
	_STT = "SessionTokenType";
	_TMRE$1 = "TooManyRequestsException";
	_UE = "UnauthorizedException";
	_aI = "accountId";
	_aKI$1 = "accessKeyId";
	_aT$1 = "accessToken";
	_ai = "account_id";
	_c$2 = "client";
	_e$2 = "error";
	_ex = "expiration";
	_h$1 = "http";
	_hE$2 = "httpError";
	_hH = "httpHeader";
	_hQ = "httpQuery";
	_m$2 = "message";
	_rC = "roleCredentials";
	_rN = "roleName";
	_rn = "role_name";
	_s$2 = "smithy.ts.sdk.synthetic.com.amazonaws.sso";
	_sAK$1 = "secretAccessKey";
	_sT$1 = "sessionToken";
	_xasbt = "x-amz-sso_bearer_token";
	n0$2 = "com.amazonaws.sso";
	_s_registry$2 = new TypeRegistry(_s$2);
	SSOServiceException$ = [
		-3,
		_s$2,
		"SSOServiceException",
		0,
		[],
		[]
	];
	_s_registry$2.registerError(SSOServiceException$, SSOServiceException);
	n0_registry$2 = new TypeRegistry(n0$2);
	InvalidRequestException$ = [
		-3,
		n0$2,
		_IRE,
		{
			[_e$2]: _c$2,
			[_hE$2]: 400
		},
		[_m$2],
		[0]
	];
	n0_registry$2.registerError(InvalidRequestException$, InvalidRequestException);
	ResourceNotFoundException$ = [
		-3,
		n0$2,
		_RNFE,
		{
			[_e$2]: _c$2,
			[_hE$2]: 404
		},
		[_m$2],
		[0]
	];
	n0_registry$2.registerError(ResourceNotFoundException$, ResourceNotFoundException);
	TooManyRequestsException$ = [
		-3,
		n0$2,
		_TMRE$1,
		{
			[_e$2]: _c$2,
			[_hE$2]: 429
		},
		[_m$2],
		[0]
	];
	n0_registry$2.registerError(TooManyRequestsException$, TooManyRequestsException);
	UnauthorizedException$ = [
		-3,
		n0$2,
		_UE,
		{
			[_e$2]: _c$2,
			[_hE$2]: 401
		},
		[_m$2],
		[0]
	];
	n0_registry$2.registerError(UnauthorizedException$, UnauthorizedException);
	errorTypeRegistries$2 = [_s_registry$2, n0_registry$2];
	AccessTokenType = [
		0,
		n0$2,
		_ATT,
		8,
		0
	];
	SecretAccessKeyType = [
		0,
		n0$2,
		_SAKT,
		8,
		0
	];
	SessionTokenType = [
		0,
		n0$2,
		_STT,
		8,
		0
	];
	GetRoleCredentialsRequest$ = [
		3,
		n0$2,
		_GRCR,
		0,
		[
			_rN,
			_aI,
			_aT$1
		],
		[
			[0, { [_hQ]: _rn }],
			[0, { [_hQ]: _ai }],
			[() => AccessTokenType, { [_hH]: _xasbt }]
		],
		3
	];
	GetRoleCredentialsResponse$ = [
		3,
		n0$2,
		_GRCRe,
		0,
		[_rC],
		[[() => RoleCredentials$, 0]]
	];
	RoleCredentials$ = [
		3,
		n0$2,
		_RC,
		0,
		[
			_aKI$1,
			_sAK$1,
			_sT$1,
			_ex
		],
		[
			0,
			[() => SecretAccessKeyType, 0],
			[() => SessionTokenType, 0],
			1
		]
	];
	GetRoleCredentials$ = [
		9,
		n0$2,
		_GRC,
		{ [_h$1]: [
			"GET",
			"/federation/credentials",
			200
		] },
		() => GetRoleCredentialsRequest$,
		() => GetRoleCredentialsResponse$
	];
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso/runtimeConfig.shared.js
var getRuntimeConfig$7;
var init_runtimeConfig_shared$2 = __esmMin((() => {
	init_httpAuthSchemes();
	init_protocols();
	init_dist_es$13();
	init_checksum();
	init_client$1();
	init_protocols$1();
	init_serde();
	init_httpAuthSchemeProvider$2();
	init_endpointResolver$2();
	init_schemas_0$2();
	getRuntimeConfig$7 = (config) => {
		return {
			apiVersion: "2019-06-10",
			base64Decoder: config?.base64Decoder ?? fromBase64,
			base64Encoder: config?.base64Encoder ?? toBase64$1,
			disableHostPrefix: config?.disableHostPrefix ?? false,
			endpointProvider: config?.endpointProvider ?? defaultEndpointResolver$2,
			extensions: config?.extensions ?? [],
			httpAuthSchemeProvider: config?.httpAuthSchemeProvider ?? defaultSSOHttpAuthSchemeProvider,
			httpAuthSchemes: config?.httpAuthSchemes ?? [{
				schemeId: "aws.auth#sigv4",
				identityProvider: (ipc) => ipc.getIdentityProvider("aws.auth#sigv4"),
				signer: new AwsSdkSigV4Signer()
			}, {
				schemeId: "smithy.api#noAuth",
				identityProvider: (ipc) => ipc.getIdentityProvider("smithy.api#noAuth") || (async () => ({})),
				signer: new NoAuthSigner()
			}],
			logger: config?.logger ?? new NoOpLogger(),
			protocol: config?.protocol ?? AwsRestJsonProtocol,
			protocolSettings: config?.protocolSettings ?? {
				defaultNamespace: "com.amazonaws.sso",
				errorTypeRegistries: errorTypeRegistries$2,
				version: "2019-06-10",
				serviceTarget: "SWBPortalService"
			},
			serviceId: config?.serviceId ?? "SSO",
			sha256: config?.sha256 ?? Sha256Node,
			urlParser: config?.urlParser ?? parseUrl,
			utf8Decoder: config?.utf8Decoder ?? fromUtf8$1,
			utf8Encoder: config?.utf8Encoder ?? toUtf8$1
		};
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso/runtimeConfig.js
var getRuntimeConfig$6;
var init_runtimeConfig$2 = __esmMin((() => {
	init_package();
	init_client();
	init_httpAuthSchemes();
	init_client$1();
	init_config$1();
	init_retry$1();
	init_serde();
	init_dist_es$7();
	init_runtimeConfig_shared$2();
	getRuntimeConfig$6 = (config) => {
		emitWarningIfUnsupportedVersion(process.version);
		const defaultsMode = resolveDefaultsModeConfig(config);
		const defaultConfigProvider = () => defaultsMode().then(loadConfigsForDefaultMode);
		const clientSharedValues = getRuntimeConfig$7(config);
		emitWarningIfUnsupportedVersion$1(process.version);
		const loaderConfig = {
			profile: config?.profile,
			logger: clientSharedValues.logger
		};
		return {
			...clientSharedValues,
			...config,
			runtime: "node",
			defaultsMode,
			authSchemePreference: config?.authSchemePreference ?? loadConfig(NODE_AUTH_SCHEME_PREFERENCE_OPTIONS, loaderConfig),
			bodyLengthChecker: config?.bodyLengthChecker ?? calculateBodyLength,
			defaultUserAgentProvider: config?.defaultUserAgentProvider ?? createDefaultUserAgentProvider({
				serviceId: clientSharedValues.serviceId,
				clientVersion: package_default.version
			}),
			maxAttempts: config?.maxAttempts ?? loadConfig(NODE_MAX_ATTEMPT_CONFIG_OPTIONS, config),
			region: config?.region ?? loadConfig(NODE_REGION_CONFIG_OPTIONS, {
				...NODE_REGION_CONFIG_FILE_OPTIONS,
				...loaderConfig
			}),
			requestHandler: NodeHttpHandler.create(config?.requestHandler ?? defaultConfigProvider),
			retryMode: config?.retryMode ?? loadConfig({
				...NODE_RETRY_MODE_CONFIG_OPTIONS,
				default: async () => (await defaultConfigProvider()).retryMode || DEFAULT_RETRY_MODE
			}, config),
			streamCollector: config?.streamCollector ?? streamCollector,
			useDualstackEndpoint: config?.useDualstackEndpoint ?? loadConfig(NODE_USE_DUALSTACK_ENDPOINT_CONFIG_OPTIONS, loaderConfig),
			useFipsEndpoint: config?.useFipsEndpoint ?? loadConfig(NODE_USE_FIPS_ENDPOINT_CONFIG_OPTIONS, loaderConfig),
			userAgentAppId: config?.userAgentAppId ?? loadConfig(NODE_APP_ID_CONFIG_OPTIONS, loaderConfig)
		};
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso/auth/httpAuthExtensionConfiguration.js
var getHttpAuthExtensionConfiguration$3, resolveHttpAuthRuntimeConfig$3;
var init_httpAuthExtensionConfiguration$2 = __esmMin((() => {
	getHttpAuthExtensionConfiguration$3 = (runtimeConfig) => {
		const _httpAuthSchemes = runtimeConfig.httpAuthSchemes;
		let _httpAuthSchemeProvider = runtimeConfig.httpAuthSchemeProvider;
		let _credentials = runtimeConfig.credentials;
		return {
			setHttpAuthScheme(httpAuthScheme) {
				const index = _httpAuthSchemes.findIndex((scheme) => scheme.schemeId === httpAuthScheme.schemeId);
				if (index === -1) _httpAuthSchemes.push(httpAuthScheme);
				else _httpAuthSchemes.splice(index, 1, httpAuthScheme);
			},
			httpAuthSchemes() {
				return _httpAuthSchemes;
			},
			setHttpAuthSchemeProvider(httpAuthSchemeProvider) {
				_httpAuthSchemeProvider = httpAuthSchemeProvider;
			},
			httpAuthSchemeProvider() {
				return _httpAuthSchemeProvider;
			},
			setCredentials(credentials) {
				_credentials = credentials;
			},
			credentials() {
				return _credentials;
			}
		};
	};
	resolveHttpAuthRuntimeConfig$3 = (config) => {
		return {
			httpAuthSchemes: config.httpAuthSchemes(),
			httpAuthSchemeProvider: config.httpAuthSchemeProvider(),
			credentials: config.credentials()
		};
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso/runtimeExtensions.js
var resolveRuntimeExtensions$3;
var init_runtimeExtensions$2 = __esmMin((() => {
	init_client();
	init_client$1();
	init_protocols$1();
	init_httpAuthExtensionConfiguration$2();
	resolveRuntimeExtensions$3 = (runtimeConfig, extensions) => {
		const extensionConfiguration = Object.assign(getAwsRegionExtensionConfiguration(runtimeConfig), getDefaultExtensionConfiguration(runtimeConfig), getHttpHandlerExtensionConfiguration(runtimeConfig), getHttpAuthExtensionConfiguration$3(runtimeConfig));
		extensions.forEach((extension) => extension.configure(extensionConfiguration));
		return Object.assign(runtimeConfig, resolveAwsRegionExtensionConfiguration(extensionConfiguration), resolveDefaultRuntimeConfig(extensionConfiguration), resolveHttpHandlerRuntimeConfig(extensionConfiguration), resolveHttpAuthRuntimeConfig$3(extensionConfiguration));
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso/SSOClient.js
var SSOClient;
var init_SSOClient = __esmMin((() => {
	init_client();
	init_dist_es$13();
	init_client$1();
	init_config$1();
	init_endpoints();
	init_protocols$1();
	init_retry$1();
	init_schema();
	init_httpAuthSchemeProvider$2();
	init_EndpointParameters$2();
	init_runtimeConfig$2();
	init_runtimeExtensions$2();
	SSOClient = class extends Client {
		config;
		constructor(...[configuration]) {
			const _config_0 = getRuntimeConfig$6(configuration || {});
			super(_config_0);
			this.initConfig = _config_0;
			const _config_2 = resolveUserAgentConfig(resolveClientEndpointParameters$2(_config_0));
			const _config_3 = resolveRetryConfig(_config_2);
			const _config_5 = resolveHostHeaderConfig(resolveRegionConfig(_config_3));
			const _config_6 = resolveEndpointConfig(_config_5);
			const _config_7 = resolveHttpAuthSchemeConfig$2(_config_6);
			const _config_8 = resolveRuntimeExtensions$3(_config_7, configuration?.extensions || []);
			this.config = _config_8;
			this.middlewareStack.use(getSchemaSerdePlugin(this.config));
			this.middlewareStack.use(getUserAgentPlugin(this.config));
			this.middlewareStack.use(getRetryPlugin(this.config));
			this.middlewareStack.use(getContentLengthPlugin(this.config));
			this.middlewareStack.use(getHostHeaderPlugin(this.config));
			this.middlewareStack.use(getLoggerPlugin(this.config));
			this.middlewareStack.use(getRecursionDetectionPlugin(this.config));
			this.middlewareStack.use(getHttpAuthSchemeEndpointRuleSetPlugin(this.config, {
				httpAuthSchemeParametersProvider: defaultSSOHttpAuthSchemeParametersProvider,
				identityProviderConfigProvider: async (config) => new DefaultIdentityProviderConfig({ "aws.auth#sigv4": config.credentials })
			}));
			this.middlewareStack.use(getHttpSigningPlugin(this.config));
		}
		destroy() {
			super.destroy();
		}
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso/commandBuilder.js
var command$2, _ep0$2, _mw0$2;
var init_commandBuilder$2 = __esmMin((() => {
	init_client$1();
	init_endpoints();
	init_EndpointParameters$2();
	command$2 = makeBuilder(commonParams$2, "SWBPortalService", "SSOClient", getEndpointPlugin);
	_ep0$2 = {};
	_mw0$2 = (Command, cs, config, o) => [];
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso/commands/GetRoleCredentialsCommand.js
var GetRoleCredentialsCommand;
var init_GetRoleCredentialsCommand = __esmMin((() => {
	init_commandBuilder$2();
	init_schemas_0$2();
	GetRoleCredentialsCommand = class extends command$2(_ep0$2, _mw0$2, "GetRoleCredentials", GetRoleCredentials$) {};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso/SSO.js
var init_SSO = __esmMin((() => {}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso/commands/index.js
var init_commands$2 = __esmMin((() => {
	init_GetRoleCredentialsCommand();
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso/models/models_0.js
var init_models_0$2 = __esmMin((() => {}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso/index.js
var init_sso = __esmMin((() => {
	init_SSOClient();
	init_SSO();
	init_commands$2();
	init_client$1();
	init_schemas_0$2();
	init_errors$2();
	init_models_0$2();
	init_SSOServiceException();
}));
//#endregion
//#region ../../node_modules/@aws-sdk/credential-provider-sso/dist-es/loadSso.js
var loadSso_exports = /* @__PURE__ */ __exportAll({
	GetRoleCredentialsCommand: () => GetRoleCredentialsCommand,
	SSOClient: () => SSOClient
});
var init_loadSso = __esmMin((() => {
	init_sso();
}));
//#endregion
//#region ../../node_modules/@aws-sdk/credential-provider-sso/dist-es/resolveSSOCredentials.js
var SHOULD_FAIL_CREDENTIAL_CHAIN, resolveSSOCredentials;
var init_resolveSSOCredentials = __esmMin((() => {
	init_client();
	init_dist_es$5();
	init_config$1();
	SHOULD_FAIL_CREDENTIAL_CHAIN = false;
	resolveSSOCredentials = async ({ ssoStartUrl, ssoSession, ssoAccountId, ssoRegion, ssoRoleName, ssoClient, clientConfig, parentClientConfig, callerClientConfig, profile, filepath, configFilepath, ignoreCache, logger }) => {
		let token;
		const refreshMessage = `To refresh this SSO session run aws sso login with the corresponding profile.`;
		if (ssoSession) try {
			const _token = await fromSso({
				profile,
				filepath,
				configFilepath,
				ignoreCache,
				clientConfig,
				parentClientConfig,
				logger
			})({ callerClientConfig });
			token = {
				accessToken: _token.token,
				expiresAt: new Date(_token.expiration).toISOString()
			};
		} catch (e) {
			throw new CredentialsProviderError(e.message, {
				tryNextLink: SHOULD_FAIL_CREDENTIAL_CHAIN,
				logger
			});
		}
		else try {
			token = await getSSOTokenFromFile(ssoStartUrl);
		} catch (e) {
			throw new CredentialsProviderError(`The SSO session associated with this profile is invalid. ${refreshMessage}`, {
				tryNextLink: SHOULD_FAIL_CREDENTIAL_CHAIN,
				logger
			});
		}
		if (new Date(token.expiresAt).getTime() - Date.now() <= 0) throw new CredentialsProviderError(`The SSO session associated with this profile has expired. ${refreshMessage}`, {
			tryNextLink: SHOULD_FAIL_CREDENTIAL_CHAIN,
			logger
		});
		const { accessToken } = token;
		const { SSOClient, GetRoleCredentialsCommand } = await Promise.resolve().then(() => (init_loadSso(), loadSso_exports));
		const sso = ssoClient || new SSOClient(Object.assign({}, clientConfig ?? {}, {
			logger: clientConfig?.logger ?? callerClientConfig?.logger ?? parentClientConfig?.logger,
			region: clientConfig?.region ?? ssoRegion,
			userAgentAppId: clientConfig?.userAgentAppId ?? callerClientConfig?.userAgentAppId ?? parentClientConfig?.userAgentAppId
		}));
		let ssoResp;
		try {
			ssoResp = await sso.send(new GetRoleCredentialsCommand({
				accountId: ssoAccountId,
				roleName: ssoRoleName,
				accessToken
			}));
		} catch (e) {
			throw new CredentialsProviderError(e, {
				tryNextLink: SHOULD_FAIL_CREDENTIAL_CHAIN,
				logger
			});
		}
		const { roleCredentials: { accessKeyId, secretAccessKey, sessionToken, expiration, credentialScope, accountId } = {} } = ssoResp;
		if (!accessKeyId || !secretAccessKey || !sessionToken || !expiration) throw new CredentialsProviderError("SSO returns an invalid temporary credential.", {
			tryNextLink: SHOULD_FAIL_CREDENTIAL_CHAIN,
			logger
		});
		const credentials = {
			accessKeyId,
			secretAccessKey,
			sessionToken,
			expiration: new Date(expiration),
			...credentialScope && { credentialScope },
			...accountId && { accountId }
		};
		if (ssoSession) setCredentialFeature(credentials, "CREDENTIALS_SSO", "s");
		else setCredentialFeature(credentials, "CREDENTIALS_SSO_LEGACY", "u");
		return credentials;
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/credential-provider-sso/dist-es/validateSsoProfile.js
var validateSsoProfile;
var init_validateSsoProfile = __esmMin((() => {
	init_config$1();
	validateSsoProfile = (profile, logger) => {
		const { sso_start_url, sso_account_id, sso_region, sso_role_name } = profile;
		if (!sso_start_url || !sso_account_id || !sso_region || !sso_role_name) throw new CredentialsProviderError(`Profile is configured with invalid SSO credentials. Required parameters "sso_account_id", "sso_region", "sso_role_name", "sso_start_url". Got ${Object.keys(profile).join(", ")}\nReference: https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sso.html`, {
			tryNextLink: false,
			logger
		});
		return profile;
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/credential-provider-sso/dist-es/fromSSO.js
var fromSSO;
var init_fromSSO = __esmMin((() => {
	init_config$1();
	init_isSsoProfile();
	init_resolveSSOCredentials();
	init_validateSsoProfile();
	fromSSO = (init = {}) => async ({ callerClientConfig } = {}) => {
		init.logger?.debug("@aws-sdk/credential-provider-sso - fromSSO");
		const { ssoStartUrl, ssoAccountId, ssoRegion, ssoRoleName, ssoSession } = init;
		const { ssoClient } = init;
		const profileName = getProfileName({ profile: init.profile ?? callerClientConfig?.profile });
		if (!ssoStartUrl && !ssoAccountId && !ssoRegion && !ssoRoleName && !ssoSession) {
			const profile = (await parseKnownFiles(init))[profileName];
			if (!profile) throw new CredentialsProviderError(`Profile ${profileName} was not found.`, { logger: init.logger });
			if (!isSsoProfile$1(profile)) throw new CredentialsProviderError(`Profile ${profileName} is not configured with SSO credentials.`, { logger: init.logger });
			if (profile?.sso_session) {
				const session = (await loadSsoSessionData(init))[profile.sso_session];
				const conflictMsg = ` configurations in profile ${profileName} and sso-session ${profile.sso_session}`;
				if (ssoRegion && ssoRegion !== session.sso_region) throw new CredentialsProviderError(`Conflicting SSO region` + conflictMsg, {
					tryNextLink: false,
					logger: init.logger
				});
				if (ssoStartUrl && ssoStartUrl !== session.sso_start_url) throw new CredentialsProviderError(`Conflicting SSO start_url` + conflictMsg, {
					tryNextLink: false,
					logger: init.logger
				});
				profile.sso_region = session.sso_region;
				profile.sso_start_url = session.sso_start_url;
			}
			const { sso_start_url, sso_account_id, sso_region, sso_role_name, sso_session } = validateSsoProfile(profile, init.logger);
			return resolveSSOCredentials({
				ssoStartUrl: sso_start_url,
				ssoSession: sso_session,
				ssoAccountId: sso_account_id,
				ssoRegion: sso_region,
				ssoRoleName: sso_role_name,
				ssoClient,
				clientConfig: init.clientConfig,
				parentClientConfig: init.parentClientConfig,
				callerClientConfig: init.callerClientConfig,
				profile: profileName,
				filepath: init.filepath,
				configFilepath: init.configFilepath,
				ignoreCache: init.ignoreCache,
				logger: init.logger
			});
		} else if (!ssoStartUrl || !ssoAccountId || !ssoRegion || !ssoRoleName) throw new CredentialsProviderError("Incomplete configuration. The fromSSO() argument hash must include \"ssoStartUrl\", \"ssoAccountId\", \"ssoRegion\", \"ssoRoleName\"", {
			tryNextLink: false,
			logger: init.logger
		});
		else return resolveSSOCredentials({
			ssoStartUrl,
			ssoSession,
			ssoAccountId,
			ssoRegion,
			ssoRoleName,
			ssoClient,
			clientConfig: init.clientConfig,
			parentClientConfig: init.parentClientConfig,
			callerClientConfig: init.callerClientConfig,
			profile: profileName,
			filepath: init.filepath,
			configFilepath: init.configFilepath,
			ignoreCache: init.ignoreCache,
			logger: init.logger
		});
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/credential-provider-sso/dist-es/index.js
var dist_es_exports$4 = /* @__PURE__ */ __exportAll({
	fromSSO: () => fromSSO,
	isSsoProfile: () => isSsoProfile$1,
	validateSsoProfile: () => validateSsoProfile
});
var init_dist_es$4 = __esmMin((() => {
	init_fromSSO();
	init_isSsoProfile();
	init_validateSsoProfile();
}));
//#endregion
//#region ../../node_modules/@aws-sdk/credential-provider-ini/dist-es/resolveCredentialSource.js
var resolveCredentialSource, setNamedProvider;
var init_resolveCredentialSource = __esmMin((() => {
	init_client();
	init_config$1();
	resolveCredentialSource = (credentialSource, profileName, logger) => {
		const sourceProvidersMap = {
			EcsContainer: async (options) => {
				const { fromHttp } = await Promise.resolve().then(() => (init_dist_es$6(), dist_es_exports$5));
				const { fromContainerMetadata } = await Promise.resolve().then(() => (init_dist_es$8(), dist_es_exports$6));
				logger?.debug("@aws-sdk/credential-provider-ini - credential_source is EcsContainer");
				return async () => chain(fromHttp(options ?? {}), fromContainerMetadata(options))().then(setNamedProvider);
			},
			Ec2InstanceMetadata: async (options) => {
				logger?.debug("@aws-sdk/credential-provider-ini - credential_source is Ec2InstanceMetadata");
				const { fromInstanceMetadata } = await Promise.resolve().then(() => (init_dist_es$8(), dist_es_exports$6));
				return async () => fromInstanceMetadata(options)().then(setNamedProvider);
			},
			Environment: async (options) => {
				logger?.debug("@aws-sdk/credential-provider-ini - credential_source is Environment");
				const { fromEnv } = await Promise.resolve().then(() => (init_dist_es$9(), dist_es_exports$7));
				return async () => fromEnv(options)().then(setNamedProvider);
			}
		};
		if (credentialSource in sourceProvidersMap) return sourceProvidersMap[credentialSource];
		else throw new CredentialsProviderError(`Unsupported credential source in profile ${profileName}. Got ${credentialSource}, expected EcsContainer or Ec2InstanceMetadata or Environment.`, { logger });
	};
	setNamedProvider = (creds) => setCredentialFeature(creds, "CREDENTIALS_PROFILE_NAMED_PROVIDER", "p");
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/sts/endpoint/bdd.js
var q$1, a$1, b$1, c$1, d$1, e$1, f$1, g$1, h$1, i$1, j$1, k$1, l$1, m$1, n$1, o$1, p$1, _data$1, root$1, nodes$1, bdd$1;
var init_bdd$1 = __esmMin((() => {
	init_endpoints();
	q$1 = "ref";
	a$1 = -1;
	b$1 = true;
	c$1 = "isSet";
	d$1 = "PartitionResult";
	e$1 = "booleanEquals";
	f$1 = "stringEquals";
	g$1 = "getAttr";
	h$1 = "us-east-1";
	i$1 = "sigv4";
	j$1 = "sts";
	k$1 = "https://sts.{Region}.{PartitionResult#dnsSuffix}";
	l$1 = { [q$1]: "Endpoint" };
	m$1 = { [q$1]: "Region" };
	n$1 = { [q$1]: d$1 };
	o$1 = {};
	p$1 = [m$1];
	_data$1 = {
		conditions: [
			[c$1, [l$1]],
			[c$1, p$1],
			[
				"aws.partition",
				p$1,
				d$1
			],
			[e$1, [{ [q$1]: "UseFIPS" }, b$1]],
			[e$1, [{ [q$1]: "UseDualStack" }, b$1]],
			[f$1, [m$1, "aws-global"]],
			[e$1, [{ [q$1]: "UseGlobalEndpoint" }, b$1]],
			[f$1, [m$1, "eu-central-1"]],
			[e$1, [{
				fn: g$1,
				argv: [n$1, "supportsDualStack"]
			}, b$1]],
			[e$1, [{
				fn: g$1,
				argv: [n$1, "supportsFIPS"]
			}, b$1]],
			[f$1, [m$1, "ap-south-1"]],
			[f$1, [m$1, "eu-north-1"]],
			[f$1, [m$1, "eu-west-1"]],
			[f$1, [m$1, "eu-west-2"]],
			[f$1, [m$1, "eu-west-3"]],
			[f$1, [m$1, "sa-east-1"]],
			[f$1, [m$1, h$1]],
			[f$1, [m$1, "us-east-2"]],
			[f$1, [m$1, "us-west-2"]],
			[f$1, [m$1, "us-west-1"]],
			[f$1, [m$1, "ca-central-1"]],
			[f$1, [m$1, "ap-southeast-1"]],
			[f$1, [m$1, "ap-northeast-1"]],
			[f$1, [m$1, "ap-southeast-2"]],
			[f$1, [{
				fn: g$1,
				argv: [n$1, "name"]
			}, "aws-us-gov"]]
		],
		results: [
			[a$1],
			["https://sts.amazonaws.com", { authSchemes: [{
				name: i$1,
				signingName: j$1,
				signingRegion: h$1
			}] }],
			[k$1, { authSchemes: [{
				name: i$1,
				signingName: j$1,
				signingRegion: "{Region}"
			}] }],
			[a$1, "Invalid Configuration: FIPS and custom endpoint are not supported"],
			[a$1, "Invalid Configuration: Dualstack and custom endpoint are not supported"],
			[l$1, o$1],
			["https://sts-fips.{Region}.{PartitionResult#dualStackDnsSuffix}", o$1],
			[a$1, "FIPS and DualStack are enabled, but this partition does not support one or both"],
			["https://sts.{Region}.amazonaws.com", o$1],
			["https://sts-fips.{Region}.{PartitionResult#dnsSuffix}", o$1],
			[a$1, "FIPS is enabled but this partition does not support FIPS"],
			["https://sts.{Region}.{PartitionResult#dualStackDnsSuffix}", o$1],
			[a$1, "DualStack is enabled but this partition does not support DualStack"],
			[k$1, o$1],
			[a$1, "Invalid Configuration: Missing Region"]
		]
	};
	root$1 = 2;
	nodes$1 = new Int32Array([
		-1,
		1,
		-1,
		0,
		30,
		3,
		1,
		4,
		100000014,
		2,
		5,
		100000014,
		3,
		25,
		6,
		4,
		24,
		7,
		5,
		100000001,
		8,
		6,
		9,
		100000013,
		7,
		100000001,
		10,
		10,
		100000001,
		11,
		11,
		100000001,
		12,
		12,
		100000001,
		13,
		13,
		100000001,
		14,
		14,
		100000001,
		15,
		15,
		100000001,
		16,
		16,
		100000001,
		17,
		17,
		100000001,
		18,
		18,
		100000001,
		19,
		19,
		100000001,
		20,
		20,
		100000001,
		21,
		21,
		100000001,
		22,
		22,
		100000001,
		23,
		23,
		100000001,
		100000002,
		8,
		100000011,
		100000012,
		4,
		28,
		26,
		9,
		27,
		100000010,
		24,
		100000008,
		100000009,
		8,
		29,
		100000007,
		9,
		100000006,
		100000007,
		3,
		100000003,
		31,
		4,
		100000004,
		100000005
	]);
	bdd$1 = BinaryDecisionDiagram.from(nodes$1, root$1, _data$1.conditions, _data$1.results);
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/sts/endpoint/endpointResolver.js
var cache$1, defaultEndpointResolver$1;
var init_endpointResolver$1 = __esmMin((() => {
	init_client();
	init_endpoints();
	init_bdd$1();
	cache$1 = new EndpointCache({
		size: 50,
		params: [
			"Endpoint",
			"Region",
			"UseDualStack",
			"UseFIPS",
			"UseGlobalEndpoint"
		]
	});
	defaultEndpointResolver$1 = (endpointParams, context = {}) => {
		return cache$1.get(endpointParams, () => decideEndpoint(bdd$1, {
			endpointParams,
			logger: context.logger
		}));
	};
	customEndpointFunctions.aws = awsEndpointFunctions;
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/sts/auth/httpAuthSchemeProvider.js
function createAwsAuthSigv4HttpAuthOption$1(authParameters) {
	return {
		schemeId: "aws.auth#sigv4",
		signingProperties: {
			name: "sts",
			region: authParameters.region
		},
		propertiesExtractor: (config, context) => ({ signingProperties: {
			config,
			context
		} })
	};
}
function createAwsAuthSigv4aHttpAuthOption(authParameters) {
	return {
		schemeId: "aws.auth#sigv4a",
		signingProperties: {
			name: "sts",
			region: authParameters.region
		},
		propertiesExtractor: (config, context) => ({ signingProperties: {
			config,
			context
		} })
	};
}
function createSmithyApiNoAuthHttpAuthOption$1(authParameters) {
	return { schemeId: "smithy.api#noAuth" };
}
var createEndpointRuleSetHttpAuthSchemeParametersProvider, _defaultSTSHttpAuthSchemeParametersProvider, defaultSTSHttpAuthSchemeParametersProvider, createEndpointRuleSetHttpAuthSchemeProvider, _defaultSTSHttpAuthSchemeProvider, defaultSTSHttpAuthSchemeProvider, resolveHttpAuthSchemeConfig$1;
var init_httpAuthSchemeProvider$1 = __esmMin((() => {
	init_httpAuthSchemes();
	init_dist_es$11();
	init_client$1();
	init_endpoints();
	init_endpointResolver$1();
	createEndpointRuleSetHttpAuthSchemeParametersProvider = (defaultHttpAuthSchemeParametersProvider) => async (config, context, input) => {
		if (!input) throw new Error("Could not find `input` for `defaultEndpointRuleSetHttpAuthSchemeParametersProvider`");
		const defaultParameters = await defaultHttpAuthSchemeParametersProvider(config, context, input);
		const instructionsFn = getSmithyContext(context)?.commandInstance?.constructor?.getEndpointParameterInstructions;
		if (!instructionsFn) throw new Error(`getEndpointParameterInstructions() is not defined on '${context.commandName}'`);
		const endpointParameters = await resolveParams(input, { getEndpointParameterInstructions: instructionsFn }, config);
		return Object.assign(defaultParameters, endpointParameters);
	};
	_defaultSTSHttpAuthSchemeParametersProvider = async (config, context, input) => {
		return {
			operation: getSmithyContext(context).operation,
			region: await normalizeProvider$1(config.region)() || (() => {
				throw new Error("expected `region` to be configured for `aws.auth#sigv4`");
			})()
		};
	};
	defaultSTSHttpAuthSchemeParametersProvider = createEndpointRuleSetHttpAuthSchemeParametersProvider(_defaultSTSHttpAuthSchemeParametersProvider);
	createEndpointRuleSetHttpAuthSchemeProvider = (defaultEndpointResolver, defaultHttpAuthSchemeResolver, createHttpAuthOptionFunctions) => {
		const endpointRuleSetHttpAuthSchemeProvider = (authParameters) => {
			const authSchemes = defaultEndpointResolver(authParameters).properties?.authSchemes;
			if (!authSchemes) return defaultHttpAuthSchemeResolver(authParameters);
			const options = [];
			for (const scheme of authSchemes) {
				const { name: resolvedName, properties = {}, ...rest } = scheme;
				const name = resolvedName.toLowerCase();
				if (resolvedName !== name) console.warn(`HttpAuthScheme has been normalized with lowercasing: '${resolvedName}' to '${name}'`);
				let schemeId;
				if (name === "sigv4a") {
					schemeId = "aws.auth#sigv4a";
					const sigv4Present = authSchemes.find((s) => {
						const name = s.name.toLowerCase();
						return name !== "sigv4a" && name.startsWith("sigv4");
					});
					if (SignatureV4MultiRegion.sigv4aDependency() === "none" && sigv4Present) continue;
				} else if (name.startsWith("sigv4")) schemeId = "aws.auth#sigv4";
				else throw new Error(`Unknown HttpAuthScheme found in '@smithy.rules#endpointRuleSet': '${name}'`);
				const createOption = createHttpAuthOptionFunctions[schemeId];
				if (!createOption) throw new Error(`Could not find HttpAuthOption create function for '${schemeId}'`);
				const option = createOption(authParameters);
				option.schemeId = schemeId;
				option.signingProperties = {
					...option.signingProperties || {},
					...rest,
					...properties
				};
				options.push(option);
			}
			return options;
		};
		return endpointRuleSetHttpAuthSchemeProvider;
	};
	_defaultSTSHttpAuthSchemeProvider = (authParameters) => {
		const options = [];
		switch (authParameters.operation) {
			case "AssumeRoleWithWebIdentity":
				options.push(createSmithyApiNoAuthHttpAuthOption$1(authParameters));
				options.push(createAwsAuthSigv4aHttpAuthOption(authParameters));
				break;
			default:
				options.push(createAwsAuthSigv4HttpAuthOption$1(authParameters));
				options.push(createAwsAuthSigv4aHttpAuthOption(authParameters));
		}
		return options;
	};
	defaultSTSHttpAuthSchemeProvider = createEndpointRuleSetHttpAuthSchemeProvider(defaultEndpointResolver$1, _defaultSTSHttpAuthSchemeProvider, {
		"aws.auth#sigv4": createAwsAuthSigv4HttpAuthOption$1,
		"aws.auth#sigv4a": createAwsAuthSigv4aHttpAuthOption,
		"smithy.api#noAuth": createSmithyApiNoAuthHttpAuthOption$1
	});
	resolveHttpAuthSchemeConfig$1 = (config) => {
		const config_0 = resolveAwsSdkSigV4Config(config);
		const config_1 = resolveAwsSdkSigV4AConfig(config_0);
		return Object.assign(config_1, { authSchemePreference: normalizeProvider$1(config.authSchemePreference ?? []) });
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/sts/endpoint/EndpointParameters.js
var resolveClientEndpointParameters$1, commonParams$1;
var init_EndpointParameters$1 = __esmMin((() => {
	resolveClientEndpointParameters$1 = (options) => {
		return Object.assign(options, {
			useDualstackEndpoint: options.useDualstackEndpoint ?? false,
			useFipsEndpoint: options.useFipsEndpoint ?? false,
			useGlobalEndpoint: options.useGlobalEndpoint ?? false,
			defaultSigningName: "sts"
		});
	};
	commonParams$1 = {
		UseGlobalEndpoint: {
			type: "builtInParams",
			name: "useGlobalEndpoint"
		},
		UseFIPS: {
			type: "builtInParams",
			name: "useFipsEndpoint"
		},
		Endpoint: {
			type: "builtInParams",
			name: "endpoint"
		},
		Region: {
			type: "builtInParams",
			name: "region"
		},
		UseDualStack: {
			type: "builtInParams",
			name: "useDualstackEndpoint"
		}
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/sts/models/STSServiceException.js
var STSServiceException;
var init_STSServiceException = __esmMin((() => {
	init_client$1();
	STSServiceException = class STSServiceException extends ServiceException {
		constructor(options) {
			super(options);
			Object.setPrototypeOf(this, STSServiceException.prototype);
		}
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/sts/models/errors.js
var ExpiredTokenException, MalformedPolicyDocumentException, PackedPolicyTooLargeException, RegionDisabledException, IDPRejectedClaimException, InvalidIdentityTokenException, IDPCommunicationErrorException;
var init_errors$1 = __esmMin((() => {
	init_STSServiceException();
	ExpiredTokenException = class ExpiredTokenException extends STSServiceException {
		name = "ExpiredTokenException";
		$fault = "client";
		constructor(opts) {
			super({
				name: "ExpiredTokenException",
				$fault: "client",
				...opts
			});
			Object.setPrototypeOf(this, ExpiredTokenException.prototype);
		}
	};
	MalformedPolicyDocumentException = class MalformedPolicyDocumentException extends STSServiceException {
		name = "MalformedPolicyDocumentException";
		$fault = "client";
		constructor(opts) {
			super({
				name: "MalformedPolicyDocumentException",
				$fault: "client",
				...opts
			});
			Object.setPrototypeOf(this, MalformedPolicyDocumentException.prototype);
		}
	};
	PackedPolicyTooLargeException = class PackedPolicyTooLargeException extends STSServiceException {
		name = "PackedPolicyTooLargeException";
		$fault = "client";
		constructor(opts) {
			super({
				name: "PackedPolicyTooLargeException",
				$fault: "client",
				...opts
			});
			Object.setPrototypeOf(this, PackedPolicyTooLargeException.prototype);
		}
	};
	RegionDisabledException = class RegionDisabledException extends STSServiceException {
		name = "RegionDisabledException";
		$fault = "client";
		constructor(opts) {
			super({
				name: "RegionDisabledException",
				$fault: "client",
				...opts
			});
			Object.setPrototypeOf(this, RegionDisabledException.prototype);
		}
	};
	IDPRejectedClaimException = class IDPRejectedClaimException extends STSServiceException {
		name = "IDPRejectedClaimException";
		$fault = "client";
		constructor(opts) {
			super({
				name: "IDPRejectedClaimException",
				$fault: "client",
				...opts
			});
			Object.setPrototypeOf(this, IDPRejectedClaimException.prototype);
		}
	};
	InvalidIdentityTokenException = class InvalidIdentityTokenException extends STSServiceException {
		name = "InvalidIdentityTokenException";
		$fault = "client";
		constructor(opts) {
			super({
				name: "InvalidIdentityTokenException",
				$fault: "client",
				...opts
			});
			Object.setPrototypeOf(this, InvalidIdentityTokenException.prototype);
		}
	};
	IDPCommunicationErrorException = class IDPCommunicationErrorException extends STSServiceException {
		name = "IDPCommunicationErrorException";
		$fault = "client";
		$retryable = {};
		constructor(opts) {
			super({
				name: "IDPCommunicationErrorException",
				$fault: "client",
				...opts
			});
			Object.setPrototypeOf(this, IDPCommunicationErrorException.prototype);
		}
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/sts/schemas/schemas_0.js
var _A, _AKI, _AR, _ARI, _ARR, _ARRs, _ARU, _ARWWI, _ARWWIR, _ARWWIRs, _Au, _C, _CA, _DS, _E, _EI, _ETE, _IDPCEE, _IDPRCE, _IITE, _K, _MPDE, _MSTS, _P, _PA, _PAr, _PC, _PCLT, _PCr, _PDT, _PI, _PPS, _PPTLE, _Pr, _RA, _RDE, _RSN, _SAK, _SFWIT, _SI, _SN, _ST, _STS, _STU, _T, _TC, _TTK, _Ta, _V, _WIT, _a, _aKST, _aQE, _c$1, _cTT, _e$1, _hE$1, _m$1, _pDLT, _s$1, _tLT, n0$1, _s_registry$1, STSServiceException$, n0_registry$1, ExpiredTokenException$, IDPCommunicationErrorException$, IDPRejectedClaimException$, InvalidIdentityTokenException$, MalformedPolicyDocumentException$, PackedPolicyTooLargeException$, RegionDisabledException$, errorTypeRegistries$1, accessKeySecretType, clientTokenType, AssumedRoleUser$, AssumeRoleRequest$, AssumeRoleResponse$, AssumeRoleWithWebIdentityRequest$, AssumeRoleWithWebIdentityResponse$, Credentials$, PolicyDescriptorType$, ProvidedContext$, Tag$, policyDescriptorListType, ProvidedContextsListType, tagListType, AssumeRole$, AssumeRoleWithWebIdentity$;
var init_schemas_0$1 = __esmMin((() => {
	init_schema();
	init_errors$1();
	init_STSServiceException();
	_A = "Arn";
	_AKI = "AccessKeyId";
	_AR = "AssumeRole";
	_ARI = "AssumedRoleId";
	_ARR = "AssumeRoleRequest";
	_ARRs = "AssumeRoleResponse";
	_ARU = "AssumedRoleUser";
	_ARWWI = "AssumeRoleWithWebIdentity";
	_ARWWIR = "AssumeRoleWithWebIdentityRequest";
	_ARWWIRs = "AssumeRoleWithWebIdentityResponse";
	_Au = "Audience";
	_C = "Credentials";
	_CA = "ContextAssertion";
	_DS = "DurationSeconds";
	_E = "Expiration";
	_EI = "ExternalId";
	_ETE = "ExpiredTokenException";
	_IDPCEE = "IDPCommunicationErrorException";
	_IDPRCE = "IDPRejectedClaimException";
	_IITE = "InvalidIdentityTokenException";
	_K = "Key";
	_MPDE = "MalformedPolicyDocumentException";
	_MSTS = "MinimumSessionTokenSize";
	_P = "Policy";
	_PA = "PolicyArns";
	_PAr = "ProviderArn";
	_PC = "ProvidedContexts";
	_PCLT = "ProvidedContextsListType";
	_PCr = "ProvidedContext";
	_PDT = "PolicyDescriptorType";
	_PI = "ProviderId";
	_PPS = "PackedPolicySize";
	_PPTLE = "PackedPolicyTooLargeException";
	_Pr = "Provider";
	_RA = "RoleArn";
	_RDE = "RegionDisabledException";
	_RSN = "RoleSessionName";
	_SAK = "SecretAccessKey";
	_SFWIT = "SubjectFromWebIdentityToken";
	_SI = "SourceIdentity";
	_SN = "SerialNumber";
	_ST = "SessionToken";
	_STS = "SessionTokenSize";
	_STU = "SessionTokenUtilization";
	_T = "Tags";
	_TC = "TokenCode";
	_TTK = "TransitiveTagKeys";
	_Ta = "Tag";
	_V = "Value";
	_WIT = "WebIdentityToken";
	_a = "arn";
	_aKST = "accessKeySecretType";
	_aQE = "awsQueryError";
	_c$1 = "client";
	_cTT = "clientTokenType";
	_e$1 = "error";
	_hE$1 = "httpError";
	_m$1 = "message";
	_pDLT = "policyDescriptorListType";
	_s$1 = "smithy.ts.sdk.synthetic.com.amazonaws.sts";
	_tLT = "tagListType";
	n0$1 = "com.amazonaws.sts";
	_s_registry$1 = new TypeRegistry(_s$1);
	STSServiceException$ = [
		-3,
		_s$1,
		"STSServiceException",
		0,
		[],
		[]
	];
	_s_registry$1.registerError(STSServiceException$, STSServiceException);
	n0_registry$1 = new TypeRegistry(n0$1);
	ExpiredTokenException$ = [
		-3,
		n0$1,
		_ETE,
		{
			[_aQE]: [`ExpiredTokenException`, 400],
			[_e$1]: _c$1,
			[_hE$1]: 400
		},
		[_m$1],
		[0]
	];
	n0_registry$1.registerError(ExpiredTokenException$, ExpiredTokenException);
	IDPCommunicationErrorException$ = [
		-3,
		n0$1,
		_IDPCEE,
		{
			[_aQE]: [`IDPCommunicationError`, 400],
			[_e$1]: _c$1,
			[_hE$1]: 400
		},
		[_m$1],
		[0]
	];
	n0_registry$1.registerError(IDPCommunicationErrorException$, IDPCommunicationErrorException);
	IDPRejectedClaimException$ = [
		-3,
		n0$1,
		_IDPRCE,
		{
			[_aQE]: [`IDPRejectedClaim`, 403],
			[_e$1]: _c$1,
			[_hE$1]: 403
		},
		[_m$1],
		[0]
	];
	n0_registry$1.registerError(IDPRejectedClaimException$, IDPRejectedClaimException);
	InvalidIdentityTokenException$ = [
		-3,
		n0$1,
		_IITE,
		{
			[_aQE]: [`InvalidIdentityToken`, 400],
			[_e$1]: _c$1,
			[_hE$1]: 400
		},
		[_m$1],
		[0]
	];
	n0_registry$1.registerError(InvalidIdentityTokenException$, InvalidIdentityTokenException);
	MalformedPolicyDocumentException$ = [
		-3,
		n0$1,
		_MPDE,
		{
			[_aQE]: [`MalformedPolicyDocument`, 400],
			[_e$1]: _c$1,
			[_hE$1]: 400
		},
		[_m$1],
		[0]
	];
	n0_registry$1.registerError(MalformedPolicyDocumentException$, MalformedPolicyDocumentException);
	PackedPolicyTooLargeException$ = [
		-3,
		n0$1,
		_PPTLE,
		{
			[_aQE]: [`PackedPolicyTooLarge`, 400],
			[_e$1]: _c$1,
			[_hE$1]: 400
		},
		[_m$1],
		[0]
	];
	n0_registry$1.registerError(PackedPolicyTooLargeException$, PackedPolicyTooLargeException);
	RegionDisabledException$ = [
		-3,
		n0$1,
		_RDE,
		{
			[_aQE]: [`RegionDisabledException`, 403],
			[_e$1]: _c$1,
			[_hE$1]: 403
		},
		[_m$1],
		[0]
	];
	n0_registry$1.registerError(RegionDisabledException$, RegionDisabledException);
	errorTypeRegistries$1 = [_s_registry$1, n0_registry$1];
	accessKeySecretType = [
		0,
		n0$1,
		_aKST,
		8,
		0
	];
	clientTokenType = [
		0,
		n0$1,
		_cTT,
		8,
		0
	];
	AssumedRoleUser$ = [
		3,
		n0$1,
		_ARU,
		0,
		[_ARI, _A],
		[0, 0],
		2
	];
	AssumeRoleRequest$ = [
		3,
		n0$1,
		_ARR,
		0,
		[
			_RA,
			_RSN,
			_PA,
			_P,
			_DS,
			_T,
			_TTK,
			_EI,
			_SN,
			_TC,
			_SI,
			_PC,
			_MSTS
		],
		[
			0,
			0,
			() => policyDescriptorListType,
			0,
			1,
			() => tagListType,
			64,
			0,
			0,
			0,
			0,
			() => ProvidedContextsListType,
			1
		],
		2
	];
	AssumeRoleResponse$ = [
		3,
		n0$1,
		_ARRs,
		0,
		[
			_C,
			_ARU,
			_PPS,
			_SI,
			_STU,
			_STS
		],
		[
			[() => Credentials$, 0],
			() => AssumedRoleUser$,
			1,
			0,
			1,
			1
		]
	];
	AssumeRoleWithWebIdentityRequest$ = [
		3,
		n0$1,
		_ARWWIR,
		0,
		[
			_RA,
			_RSN,
			_WIT,
			_PI,
			_PA,
			_P,
			_DS,
			_MSTS
		],
		[
			0,
			0,
			[() => clientTokenType, 0],
			0,
			() => policyDescriptorListType,
			0,
			1,
			1
		],
		3
	];
	AssumeRoleWithWebIdentityResponse$ = [
		3,
		n0$1,
		_ARWWIRs,
		0,
		[
			_C,
			_SFWIT,
			_ARU,
			_PPS,
			_Pr,
			_Au,
			_SI,
			_STU,
			_STS
		],
		[
			[() => Credentials$, 0],
			0,
			() => AssumedRoleUser$,
			1,
			0,
			0,
			0,
			1,
			1
		]
	];
	Credentials$ = [
		3,
		n0$1,
		_C,
		0,
		[
			_AKI,
			_SAK,
			_ST,
			_E
		],
		[
			0,
			[() => accessKeySecretType, 0],
			0,
			4
		],
		4
	];
	PolicyDescriptorType$ = [
		3,
		n0$1,
		_PDT,
		0,
		[_a],
		[0]
	];
	ProvidedContext$ = [
		3,
		n0$1,
		_PCr,
		0,
		[_PAr, _CA],
		[0, 0]
	];
	Tag$ = [
		3,
		n0$1,
		_Ta,
		0,
		[_K, _V],
		[0, 0],
		2
	];
	policyDescriptorListType = [
		1,
		n0$1,
		_pDLT,
		0,
		() => PolicyDescriptorType$
	];
	ProvidedContextsListType = [
		1,
		n0$1,
		_PCLT,
		0,
		() => ProvidedContext$
	];
	tagListType = [
		1,
		n0$1,
		_tLT,
		0,
		() => Tag$
	];
	AssumeRole$ = [
		9,
		n0$1,
		_AR,
		0,
		() => AssumeRoleRequest$,
		() => AssumeRoleResponse$
	];
	AssumeRoleWithWebIdentity$ = [
		9,
		n0$1,
		_ARWWI,
		0,
		() => AssumeRoleWithWebIdentityRequest$,
		() => AssumeRoleWithWebIdentityResponse$
	];
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/sts/runtimeConfig.shared.js
var getRuntimeConfig$5;
var init_runtimeConfig_shared$1 = __esmMin((() => {
	init_httpAuthSchemes();
	init_protocols();
	init_dist_es$11();
	init_dist_es$13();
	init_checksum();
	init_client$1();
	init_protocols$1();
	init_serde();
	init_httpAuthSchemeProvider$1();
	init_endpointResolver$1();
	init_schemas_0$1();
	getRuntimeConfig$5 = (config) => {
		return {
			apiVersion: "2011-06-15",
			base64Decoder: config?.base64Decoder ?? fromBase64,
			base64Encoder: config?.base64Encoder ?? toBase64$1,
			disableHostPrefix: config?.disableHostPrefix ?? false,
			endpointProvider: config?.endpointProvider ?? defaultEndpointResolver$1,
			extensions: config?.extensions ?? [],
			httpAuthSchemeProvider: config?.httpAuthSchemeProvider ?? defaultSTSHttpAuthSchemeProvider,
			httpAuthSchemes: config?.httpAuthSchemes ?? [
				{
					schemeId: "aws.auth#sigv4",
					identityProvider: (ipc) => ipc.getIdentityProvider("aws.auth#sigv4"),
					signer: new AwsSdkSigV4Signer()
				},
				{
					schemeId: "aws.auth#sigv4a",
					identityProvider: (ipc) => ipc.getIdentityProvider("aws.auth#sigv4a"),
					signer: new AwsSdkSigV4ASigner()
				},
				{
					schemeId: "smithy.api#noAuth",
					identityProvider: (ipc) => ipc.getIdentityProvider("smithy.api#noAuth") || (async () => ({})),
					signer: new NoAuthSigner()
				}
			],
			logger: config?.logger ?? new NoOpLogger(),
			protocol: config?.protocol ?? AwsQueryProtocol,
			protocolSettings: config?.protocolSettings ?? {
				defaultNamespace: "com.amazonaws.sts",
				errorTypeRegistries: errorTypeRegistries$1,
				xmlNamespace: "https://sts.amazonaws.com/doc/2011-06-15/",
				version: "2011-06-15",
				serviceTarget: "AWSSecurityTokenServiceV20110615"
			},
			serviceId: config?.serviceId ?? "STS",
			sha256: config?.sha256 ?? Sha256Node,
			signerConstructor: config?.signerConstructor ?? SignatureV4MultiRegion,
			urlParser: config?.urlParser ?? parseUrl,
			utf8Decoder: config?.utf8Decoder ?? fromUtf8$1,
			utf8Encoder: config?.utf8Encoder ?? toUtf8$1
		};
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/sts/runtimeConfig.js
var getRuntimeConfig$4;
var init_runtimeConfig$1 = __esmMin((() => {
	init_package();
	init_client();
	init_httpAuthSchemes();
	init_dist_es$13();
	init_client$1();
	init_config$1();
	init_retry$1();
	init_serde();
	init_dist_es$7();
	init_runtimeConfig_shared$1();
	getRuntimeConfig$4 = (config) => {
		emitWarningIfUnsupportedVersion(process.version);
		const defaultsMode = resolveDefaultsModeConfig(config);
		const defaultConfigProvider = () => defaultsMode().then(loadConfigsForDefaultMode);
		const clientSharedValues = getRuntimeConfig$5(config);
		emitWarningIfUnsupportedVersion$1(process.version);
		const loaderConfig = {
			profile: config?.profile,
			logger: clientSharedValues.logger
		};
		return {
			...clientSharedValues,
			...config,
			runtime: "node",
			defaultsMode,
			authSchemePreference: config?.authSchemePreference ?? loadConfig(NODE_AUTH_SCHEME_PREFERENCE_OPTIONS, loaderConfig),
			bodyLengthChecker: config?.bodyLengthChecker ?? calculateBodyLength,
			defaultUserAgentProvider: config?.defaultUserAgentProvider ?? createDefaultUserAgentProvider({
				serviceId: clientSharedValues.serviceId,
				clientVersion: package_default.version
			}),
			httpAuthSchemes: config?.httpAuthSchemes ?? [
				{
					schemeId: "aws.auth#sigv4",
					identityProvider: (ipc) => ipc.getIdentityProvider("aws.auth#sigv4") || (async (idProps) => await config.credentialDefaultProvider(idProps?.__config || {})()),
					signer: new AwsSdkSigV4Signer()
				},
				{
					schemeId: "aws.auth#sigv4a",
					identityProvider: (ipc) => ipc.getIdentityProvider("aws.auth#sigv4a"),
					signer: new AwsSdkSigV4ASigner()
				},
				{
					schemeId: "smithy.api#noAuth",
					identityProvider: (ipc) => ipc.getIdentityProvider("smithy.api#noAuth") || (async () => ({})),
					signer: new NoAuthSigner()
				}
			],
			maxAttempts: config?.maxAttempts ?? loadConfig(NODE_MAX_ATTEMPT_CONFIG_OPTIONS, config),
			region: config?.region ?? loadConfig(NODE_REGION_CONFIG_OPTIONS, {
				...NODE_REGION_CONFIG_FILE_OPTIONS,
				...loaderConfig
			}),
			requestHandler: NodeHttpHandler.create(config?.requestHandler ?? defaultConfigProvider),
			retryMode: config?.retryMode ?? loadConfig({
				...NODE_RETRY_MODE_CONFIG_OPTIONS,
				default: async () => (await defaultConfigProvider()).retryMode || DEFAULT_RETRY_MODE
			}, config),
			sigv4aSigningRegionSet: config?.sigv4aSigningRegionSet ?? loadConfig(NODE_SIGV4A_CONFIG_OPTIONS, loaderConfig),
			streamCollector: config?.streamCollector ?? streamCollector,
			useDualstackEndpoint: config?.useDualstackEndpoint ?? loadConfig(NODE_USE_DUALSTACK_ENDPOINT_CONFIG_OPTIONS, loaderConfig),
			useFipsEndpoint: config?.useFipsEndpoint ?? loadConfig(NODE_USE_FIPS_ENDPOINT_CONFIG_OPTIONS, loaderConfig),
			userAgentAppId: config?.userAgentAppId ?? loadConfig(NODE_APP_ID_CONFIG_OPTIONS, loaderConfig)
		};
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/sts/auth/httpAuthExtensionConfiguration.js
var getHttpAuthExtensionConfiguration$2, resolveHttpAuthRuntimeConfig$2;
var init_httpAuthExtensionConfiguration$1 = __esmMin((() => {
	getHttpAuthExtensionConfiguration$2 = (runtimeConfig) => {
		const _httpAuthSchemes = runtimeConfig.httpAuthSchemes;
		let _httpAuthSchemeProvider = runtimeConfig.httpAuthSchemeProvider;
		let _credentials = runtimeConfig.credentials;
		return {
			setHttpAuthScheme(httpAuthScheme) {
				const index = _httpAuthSchemes.findIndex((scheme) => scheme.schemeId === httpAuthScheme.schemeId);
				if (index === -1) _httpAuthSchemes.push(httpAuthScheme);
				else _httpAuthSchemes.splice(index, 1, httpAuthScheme);
			},
			httpAuthSchemes() {
				return _httpAuthSchemes;
			},
			setHttpAuthSchemeProvider(httpAuthSchemeProvider) {
				_httpAuthSchemeProvider = httpAuthSchemeProvider;
			},
			httpAuthSchemeProvider() {
				return _httpAuthSchemeProvider;
			},
			setCredentials(credentials) {
				_credentials = credentials;
			},
			credentials() {
				return _credentials;
			}
		};
	};
	resolveHttpAuthRuntimeConfig$2 = (config) => {
		return {
			httpAuthSchemes: config.httpAuthSchemes(),
			httpAuthSchemeProvider: config.httpAuthSchemeProvider(),
			credentials: config.credentials()
		};
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/sts/runtimeExtensions.js
var resolveRuntimeExtensions$2;
var init_runtimeExtensions$1 = __esmMin((() => {
	init_client();
	init_client$1();
	init_protocols$1();
	init_httpAuthExtensionConfiguration$1();
	resolveRuntimeExtensions$2 = (runtimeConfig, extensions) => {
		const extensionConfiguration = Object.assign(getAwsRegionExtensionConfiguration(runtimeConfig), getDefaultExtensionConfiguration(runtimeConfig), getHttpHandlerExtensionConfiguration(runtimeConfig), getHttpAuthExtensionConfiguration$2(runtimeConfig));
		extensions.forEach((extension) => extension.configure(extensionConfiguration));
		return Object.assign(runtimeConfig, resolveAwsRegionExtensionConfiguration(extensionConfiguration), resolveDefaultRuntimeConfig(extensionConfiguration), resolveHttpHandlerRuntimeConfig(extensionConfiguration), resolveHttpAuthRuntimeConfig$2(extensionConfiguration));
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/sts/STSClient.js
var STSClient;
var init_STSClient = __esmMin((() => {
	init_client();
	init_dist_es$13();
	init_client$1();
	init_config$1();
	init_endpoints();
	init_protocols$1();
	init_retry$1();
	init_schema();
	init_httpAuthSchemeProvider$1();
	init_EndpointParameters$1();
	init_runtimeConfig$1();
	init_runtimeExtensions$1();
	STSClient = class extends Client {
		config;
		constructor(...[configuration]) {
			const _config_0 = getRuntimeConfig$4(configuration || {});
			super(_config_0);
			this.initConfig = _config_0;
			const _config_2 = resolveUserAgentConfig(resolveClientEndpointParameters$1(_config_0));
			const _config_3 = resolveRetryConfig(_config_2);
			const _config_5 = resolveHostHeaderConfig(resolveRegionConfig(_config_3));
			const _config_6 = resolveEndpointConfig(_config_5);
			const _config_7 = resolveHttpAuthSchemeConfig$1(_config_6);
			const _config_8 = resolveRuntimeExtensions$2(_config_7, configuration?.extensions || []);
			this.config = _config_8;
			this.middlewareStack.use(getSchemaSerdePlugin(this.config));
			this.middlewareStack.use(getUserAgentPlugin(this.config));
			this.middlewareStack.use(getRetryPlugin(this.config));
			this.middlewareStack.use(getContentLengthPlugin(this.config));
			this.middlewareStack.use(getHostHeaderPlugin(this.config));
			this.middlewareStack.use(getLoggerPlugin(this.config));
			this.middlewareStack.use(getRecursionDetectionPlugin(this.config));
			this.middlewareStack.use(getHttpAuthSchemeEndpointRuleSetPlugin(this.config, {
				httpAuthSchemeParametersProvider: defaultSTSHttpAuthSchemeParametersProvider,
				identityProviderConfigProvider: async (config) => new DefaultIdentityProviderConfig({
					"aws.auth#sigv4": config.credentials,
					"aws.auth#sigv4a": config.credentials
				})
			}));
			this.middlewareStack.use(getHttpSigningPlugin(this.config));
		}
		destroy() {
			super.destroy();
		}
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/sts/commandBuilder.js
var command$1, _ep0$1, _mw0$1;
var init_commandBuilder$1 = __esmMin((() => {
	init_client$1();
	init_endpoints();
	init_EndpointParameters$1();
	command$1 = makeBuilder(commonParams$1, "AWSSecurityTokenServiceV20110615", "STSClient", getEndpointPlugin);
	_ep0$1 = {};
	_mw0$1 = (Command, cs, config, o) => [];
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/sts/commands/AssumeRoleCommand.js
var AssumeRoleCommand;
var init_AssumeRoleCommand = __esmMin((() => {
	init_commandBuilder$1();
	init_schemas_0$1();
	AssumeRoleCommand = class extends command$1(_ep0$1, _mw0$1, "AssumeRole", AssumeRole$) {};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/sts/commands/AssumeRoleWithWebIdentityCommand.js
var AssumeRoleWithWebIdentityCommand;
var init_AssumeRoleWithWebIdentityCommand = __esmMin((() => {
	init_commandBuilder$1();
	init_schemas_0$1();
	AssumeRoleWithWebIdentityCommand = class extends command$1(_ep0$1, _mw0$1, "AssumeRoleWithWebIdentity", AssumeRoleWithWebIdentity$) {};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/sts/STS.js
var commands$1, STS;
var init_STS = __esmMin((() => {
	init_client$1();
	init_AssumeRoleCommand();
	init_AssumeRoleWithWebIdentityCommand();
	init_STSClient();
	commands$1 = {
		AssumeRoleCommand,
		AssumeRoleWithWebIdentityCommand
	};
	STS = class extends STSClient {};
	createAggregatedClient(commands$1, STS);
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/sts/commands/index.js
var init_commands$1 = __esmMin((() => {
	init_AssumeRoleCommand();
	init_AssumeRoleWithWebIdentityCommand();
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/sts/models/models_0.js
var init_models_0$1 = __esmMin((() => {}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/sts/defaultStsRoleAssumers.js
var getAccountIdFromAssumedRoleUser, resolveRegion, getDefaultRoleAssumer$1, getDefaultRoleAssumerWithWebIdentity$1, isH2;
var init_defaultStsRoleAssumers = __esmMin((() => {
	init_client();
	init_AssumeRoleCommand();
	init_AssumeRoleWithWebIdentityCommand();
	getAccountIdFromAssumedRoleUser = (assumedRoleUser) => {
		if (typeof assumedRoleUser?.Arn === "string") {
			const arnComponents = assumedRoleUser.Arn.split(":");
			if (arnComponents.length > 4 && arnComponents[4] !== "") return arnComponents[4];
		}
	};
	resolveRegion = async (_region, _parentRegion, credentialProviderLogger, loaderConfig = {}) => {
		const region = typeof _region === "function" ? await _region() : _region;
		const parentRegion = typeof _parentRegion === "function" ? await _parentRegion() : _parentRegion;
		let stsDefaultRegion = "";
		const resolvedRegion = region ?? parentRegion ?? (stsDefaultRegion = await stsRegionDefaultResolver(loaderConfig)());
		credentialProviderLogger?.debug?.("@aws-sdk/client-sts::resolveRegion", "accepting first of:", `${region} (credential provider clientConfig)`, `${parentRegion} (contextual client)`, `${stsDefaultRegion} (STS default: AWS_REGION, profile region, or us-east-1)`);
		return resolvedRegion;
	};
	getDefaultRoleAssumer$1 = (stsOptions, STSClient) => {
		let stsClient;
		let closureSourceCreds;
		return async (sourceCreds, params) => {
			closureSourceCreds = sourceCreds;
			if (!stsClient) {
				const { logger = stsOptions?.parentClientConfig?.logger, profile = stsOptions?.parentClientConfig?.profile, region, requestHandler = stsOptions?.parentClientConfig?.requestHandler, credentialProviderLogger, userAgentAppId = stsOptions?.parentClientConfig?.userAgentAppId } = stsOptions;
				const resolvedRegion = await resolveRegion(region, stsOptions?.parentClientConfig?.region, credentialProviderLogger, {
					logger,
					profile
				});
				const isCompatibleRequestHandler = !isH2(requestHandler);
				stsClient = new STSClient({
					...stsOptions,
					userAgentAppId,
					profile,
					credentialDefaultProvider: () => async () => closureSourceCreds,
					region: resolvedRegion,
					requestHandler: isCompatibleRequestHandler ? requestHandler : void 0,
					logger
				});
			}
			const { Credentials, AssumedRoleUser } = await stsClient.send(new AssumeRoleCommand(params));
			if (!Credentials || !Credentials.AccessKeyId || !Credentials.SecretAccessKey) throw new Error(`Invalid response from STS.assumeRole call with role ${params.RoleArn}`);
			const accountId = getAccountIdFromAssumedRoleUser(AssumedRoleUser);
			const credentials = {
				accessKeyId: Credentials.AccessKeyId,
				secretAccessKey: Credentials.SecretAccessKey,
				sessionToken: Credentials.SessionToken,
				expiration: Credentials.Expiration,
				...Credentials.CredentialScope && { credentialScope: Credentials.CredentialScope },
				...accountId && { accountId }
			};
			setCredentialFeature(credentials, "CREDENTIALS_STS_ASSUME_ROLE", "i");
			return credentials;
		};
	};
	getDefaultRoleAssumerWithWebIdentity$1 = (stsOptions, STSClient) => {
		let stsClient;
		return async (params) => {
			if (!stsClient) {
				const { logger = stsOptions?.parentClientConfig?.logger, profile = stsOptions?.parentClientConfig?.profile, region, requestHandler = stsOptions?.parentClientConfig?.requestHandler, credentialProviderLogger, userAgentAppId = stsOptions?.parentClientConfig?.userAgentAppId } = stsOptions;
				const resolvedRegion = await resolveRegion(region, stsOptions?.parentClientConfig?.region, credentialProviderLogger, {
					logger,
					profile
				});
				const isCompatibleRequestHandler = !isH2(requestHandler);
				stsClient = new STSClient({
					...stsOptions,
					userAgentAppId,
					profile,
					region: resolvedRegion,
					requestHandler: isCompatibleRequestHandler ? requestHandler : void 0,
					logger
				});
			}
			const { Credentials, AssumedRoleUser } = await stsClient.send(new AssumeRoleWithWebIdentityCommand(params));
			if (!Credentials || !Credentials.AccessKeyId || !Credentials.SecretAccessKey) throw new Error(`Invalid response from STS.assumeRoleWithWebIdentity call with role ${params.RoleArn}`);
			const accountId = getAccountIdFromAssumedRoleUser(AssumedRoleUser);
			const credentials = {
				accessKeyId: Credentials.AccessKeyId,
				secretAccessKey: Credentials.SecretAccessKey,
				sessionToken: Credentials.SessionToken,
				expiration: Credentials.Expiration,
				...Credentials.CredentialScope && { credentialScope: Credentials.CredentialScope },
				...accountId && { accountId }
			};
			if (accountId) setCredentialFeature(credentials, "RESOLVED_ACCOUNT_ID", "T");
			setCredentialFeature(credentials, "CREDENTIALS_STS_ASSUME_ROLE_WEB_ID", "k");
			return credentials;
		};
	};
	isH2 = (requestHandler) => {
		return requestHandler?.metadata?.handlerProtocol === "h2";
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/sts/defaultRoleAssumers.js
var getCustomizableStsClientCtor, getDefaultRoleAssumer, getDefaultRoleAssumerWithWebIdentity, decorateDefaultCredentialProvider;
var init_defaultRoleAssumers = __esmMin((() => {
	init_defaultStsRoleAssumers();
	init_STSClient();
	getCustomizableStsClientCtor = (baseCtor, customizations) => {
		if (!customizations) return baseCtor;
		else return class CustomizableSTSClient extends baseCtor {
			constructor(config) {
				super(config);
				for (const customization of customizations) this.middlewareStack.use(customization);
			}
		};
	};
	getDefaultRoleAssumer = (stsOptions = {}, stsPlugins) => getDefaultRoleAssumer$1(stsOptions, getCustomizableStsClientCtor(STSClient, stsPlugins));
	getDefaultRoleAssumerWithWebIdentity = (stsOptions = {}, stsPlugins) => getDefaultRoleAssumerWithWebIdentity$1(stsOptions, getCustomizableStsClientCtor(STSClient, stsPlugins));
	decorateDefaultCredentialProvider = (provider) => (input) => provider({
		roleAssumer: getDefaultRoleAssumer(input),
		roleAssumerWithWebIdentity: getDefaultRoleAssumerWithWebIdentity(input),
		...input
	});
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/sts/index.js
var sts_exports = /* @__PURE__ */ __exportAll({
	$Command: () => Command,
	AssumeRole$: () => AssumeRole$,
	AssumeRoleCommand: () => AssumeRoleCommand,
	AssumeRoleRequest$: () => AssumeRoleRequest$,
	AssumeRoleResponse$: () => AssumeRoleResponse$,
	AssumeRoleWithWebIdentity$: () => AssumeRoleWithWebIdentity$,
	AssumeRoleWithWebIdentityCommand: () => AssumeRoleWithWebIdentityCommand,
	AssumeRoleWithWebIdentityRequest$: () => AssumeRoleWithWebIdentityRequest$,
	AssumeRoleWithWebIdentityResponse$: () => AssumeRoleWithWebIdentityResponse$,
	AssumedRoleUser$: () => AssumedRoleUser$,
	Credentials$: () => Credentials$,
	ExpiredTokenException: () => ExpiredTokenException,
	ExpiredTokenException$: () => ExpiredTokenException$,
	IDPCommunicationErrorException: () => IDPCommunicationErrorException,
	IDPCommunicationErrorException$: () => IDPCommunicationErrorException$,
	IDPRejectedClaimException: () => IDPRejectedClaimException,
	IDPRejectedClaimException$: () => IDPRejectedClaimException$,
	InvalidIdentityTokenException: () => InvalidIdentityTokenException,
	InvalidIdentityTokenException$: () => InvalidIdentityTokenException$,
	MalformedPolicyDocumentException: () => MalformedPolicyDocumentException,
	MalformedPolicyDocumentException$: () => MalformedPolicyDocumentException$,
	PackedPolicyTooLargeException: () => PackedPolicyTooLargeException,
	PackedPolicyTooLargeException$: () => PackedPolicyTooLargeException$,
	PolicyDescriptorType$: () => PolicyDescriptorType$,
	ProvidedContext$: () => ProvidedContext$,
	RegionDisabledException: () => RegionDisabledException,
	RegionDisabledException$: () => RegionDisabledException$,
	STS: () => STS,
	STSClient: () => STSClient,
	STSServiceException: () => STSServiceException,
	STSServiceException$: () => STSServiceException$,
	Tag$: () => Tag$,
	__Client: () => Client,
	decorateDefaultCredentialProvider: () => decorateDefaultCredentialProvider,
	errorTypeRegistries: () => errorTypeRegistries$1,
	getDefaultRoleAssumer: () => getDefaultRoleAssumer,
	getDefaultRoleAssumerWithWebIdentity: () => getDefaultRoleAssumerWithWebIdentity
});
var init_sts = __esmMin((() => {
	init_STSClient();
	init_STS();
	init_commands$1();
	init_client$1();
	init_schemas_0$1();
	init_errors$1();
	init_models_0$1();
	init_defaultRoleAssumers();
	init_STSServiceException();
}));
//#endregion
//#region ../../node_modules/@aws-sdk/credential-provider-ini/dist-es/resolveAssumeRoleCredentials.js
var isAssumeRoleProfile, isAssumeRoleWithSourceProfile, isCredentialSourceProfile, resolveAssumeRoleCredentials, isCredentialSourceWithoutRoleArn;
var init_resolveAssumeRoleCredentials = __esmMin((() => {
	init_client();
	init_config$1();
	init_resolveCredentialSource();
	isAssumeRoleProfile = (arg, { profile = "default", logger } = {}) => {
		return Boolean(arg) && typeof arg === "object" && typeof arg.role_arn === "string" && ["undefined", "string"].indexOf(typeof arg.role_session_name) > -1 && ["undefined", "string"].indexOf(typeof arg.external_id) > -1 && ["undefined", "string"].indexOf(typeof arg.mfa_serial) > -1 && (isAssumeRoleWithSourceProfile(arg, {
			profile,
			logger
		}) || isCredentialSourceProfile(arg, {
			profile,
			logger
		}));
	};
	isAssumeRoleWithSourceProfile = (arg, { profile, logger }) => {
		const withSourceProfile = typeof arg.source_profile === "string" && typeof arg.credential_source === "undefined";
		if (withSourceProfile) logger?.debug?.(`    ${profile} isAssumeRoleWithSourceProfile source_profile=${arg.source_profile}`);
		return withSourceProfile;
	};
	isCredentialSourceProfile = (arg, { profile, logger }) => {
		const withProviderProfile = typeof arg.credential_source === "string" && typeof arg.source_profile === "undefined";
		if (withProviderProfile) logger?.debug?.(`    ${profile} isCredentialSourceProfile credential_source=${arg.credential_source}`);
		return withProviderProfile;
	};
	resolveAssumeRoleCredentials = async (profileName, profiles, options, callerClientConfig, visitedProfiles = {}, resolveProfileData) => {
		options.logger?.debug("@aws-sdk/credential-provider-ini - resolveAssumeRoleCredentials (STS)");
		const profileData = profiles[profileName];
		const { source_profile, region } = profileData;
		if (!options.roleAssumer) {
			const { getDefaultRoleAssumer } = await Promise.resolve().then(() => (init_sts(), sts_exports));
			options.roleAssumer = getDefaultRoleAssumer({
				...options.clientConfig,
				credentialProviderLogger: options.logger,
				parentClientConfig: {
					...callerClientConfig,
					...options?.parentClientConfig,
					region: region ?? options?.parentClientConfig?.region ?? callerClientConfig?.region
				}
			}, options.clientPlugins);
		}
		if (source_profile && source_profile in visitedProfiles) throw new CredentialsProviderError(`Detected a cycle attempting to resolve credentials for profile ${getProfileName(options)}. Profiles visited: ` + Object.keys(visitedProfiles).join(", "), { logger: options.logger });
		options.logger?.debug(`@aws-sdk/credential-provider-ini - finding credential resolver using ${source_profile ? `source_profile=[${source_profile}]` : `profile=[${profileName}]`}`);
		const sourceCredsProvider = source_profile ? resolveProfileData(source_profile, profiles, options, callerClientConfig, {
			...visitedProfiles,
			[source_profile]: true
		}, isCredentialSourceWithoutRoleArn(profiles[source_profile] ?? {})) : (await resolveCredentialSource(profileData.credential_source, profileName, options.logger)(options))();
		if (isCredentialSourceWithoutRoleArn(profileData)) return sourceCredsProvider.then((creds) => setCredentialFeature(creds, "CREDENTIALS_PROFILE_SOURCE_PROFILE", "o"));
		else {
			const params = {
				RoleArn: profileData.role_arn,
				RoleSessionName: profileData.role_session_name || `aws-sdk-js-${Date.now()}`,
				ExternalId: profileData.external_id,
				DurationSeconds: parseInt(profileData.duration_seconds || "3600", 10)
			};
			const { mfa_serial } = profileData;
			if (mfa_serial) {
				if (!options.mfaCodeProvider) throw new CredentialsProviderError(`Profile ${profileName} requires multi-factor authentication, but no MFA code callback was provided.`, {
					logger: options.logger,
					tryNextLink: false
				});
				params.SerialNumber = mfa_serial;
				params.TokenCode = await options.mfaCodeProvider(mfa_serial);
			}
			const sourceCreds = await sourceCredsProvider;
			return options.roleAssumer(sourceCreds, params).then((creds) => setCredentialFeature(creds, "CREDENTIALS_PROFILE_SOURCE_PROFILE", "o"));
		}
	};
	isCredentialSourceWithoutRoleArn = (section) => {
		return !section.role_arn && !!section.credential_source;
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/signin/auth/httpAuthSchemeProvider.js
function createAwsAuthSigv4HttpAuthOption(authParameters) {
	return {
		schemeId: "aws.auth#sigv4",
		signingProperties: {
			name: "signin",
			region: authParameters.region
		},
		propertiesExtractor: (config, context) => ({ signingProperties: {
			config,
			context
		} })
	};
}
function createSmithyApiNoAuthHttpAuthOption(authParameters) {
	return { schemeId: "smithy.api#noAuth" };
}
var defaultSigninHttpAuthSchemeParametersProvider, defaultSigninHttpAuthSchemeProvider, resolveHttpAuthSchemeConfig;
var init_httpAuthSchemeProvider = __esmMin((() => {
	init_httpAuthSchemes();
	init_client$1();
	defaultSigninHttpAuthSchemeParametersProvider = async (config, context, input) => {
		return {
			operation: getSmithyContext(context).operation,
			region: await normalizeProvider$1(config.region)() || (() => {
				throw new Error("expected `region` to be configured for `aws.auth#sigv4`");
			})()
		};
	};
	defaultSigninHttpAuthSchemeProvider = (authParameters) => {
		const options = [];
		switch (authParameters.operation) {
			case "CreateOAuth2Token":
				options.push(createSmithyApiNoAuthHttpAuthOption(authParameters));
				break;
			default: options.push(createAwsAuthSigv4HttpAuthOption(authParameters));
		}
		return options;
	};
	resolveHttpAuthSchemeConfig = (config) => {
		const config_0 = resolveAwsSdkSigV4Config(config);
		return Object.assign(config_0, { authSchemePreference: normalizeProvider$1(config.authSchemePreference ?? []) });
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/signin/endpoint/EndpointParameters.js
var resolveClientEndpointParameters, commonParams;
var init_EndpointParameters = __esmMin((() => {
	resolveClientEndpointParameters = (options) => {
		return Object.assign(options, {
			useDualstackEndpoint: options.useDualstackEndpoint ?? false,
			useFipsEndpoint: options.useFipsEndpoint ?? false,
			defaultSigningName: "signin"
		});
	};
	commonParams = {
		UseFIPS: {
			type: "builtInParams",
			name: "useFipsEndpoint"
		},
		Endpoint: {
			type: "builtInParams",
			name: "endpoint"
		},
		Region: {
			type: "builtInParams",
			name: "region"
		},
		UseDualStack: {
			type: "builtInParams",
			name: "useDualstackEndpoint"
		}
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/signin/endpoint/bdd.js
var s, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, _data, root, nodes, bdd;
var init_bdd = __esmMin((() => {
	init_endpoints();
	s = "ref";
	a = -1;
	b = false;
	c = true;
	d = "isSet";
	e = "booleanEquals";
	f = "coalesce";
	g = "PartitionResult";
	h = "stringEquals";
	i = "getAttr";
	j = "https://signin.{Region}.{PartitionResult#dualStackDnsSuffix}";
	k = { [s]: "Endpoint" };
	l = {
		"fn": i,
		"argv": [{ [s]: g }, "name"]
	};
	m = { [s]: "Region" };
	n = { [s]: g };
	o = { "authSchemes": [{
		"name": "sigv4",
		"signingName": "signin",
		"signingRegion": "{Region}"
	}] };
	p = {};
	q = [m];
	_data = {
		conditions: [
			[d, q],
			[e, [{
				fn: f,
				argv: [{ [s]: "IsControlPlane" }, b]
			}, c]],
			[d, [k]],
			[
				"aws.partition",
				q,
				g
			],
			[e, [{ [s]: "UseFIPS" }, c]],
			[h, [l, "aws"]],
			[e, [{
				fn: f,
				argv: [{ [s]: "IsOAuthEndpoint" }, b]
			}, c]],
			[e, [{ [s]: "UseDualStack" }, c]],
			[h, [l, "aws-cn"]],
			[h, [m, "us-gov-west-1"]],
			[h, [l, "aws-us-gov"]],
			[e, [{
				fn: i,
				argv: [n, "supportsFIPS"]
			}, c]],
			[h, [l, "aws-iso"]],
			[h, [l, "aws-iso-b"]],
			[h, [l, "aws-iso-f"]],
			[h, [l, "aws-iso-e"]],
			[h, [l, "aws-eusc"]],
			[e, [{
				fn: i,
				argv: [n, "supportsDualStack"]
			}, c]]
		],
		results: [
			[a],
			["https://signin.{Region}.api.aws", o],
			["https://signin.{Region}.api.amazonwebservices.com.cn", o],
			[j, o],
			[a, "FIPS endpoints are not supported for OAuth operations. Disable FIPS or use a non-OAuth operation."],
			["https://{Region}.oauth.signin.aws", o],
			["https://{Region}.signin.aws.amazon.com", p],
			["https://{Region}.signin.amazonaws.cn", p],
			["https://{Region}.signin.amazonaws-us-gov.com", p],
			["https://{Region}.signin.c2shome.ic.gov", p],
			["https://{Region}.signin.sc2shome.sgov.gov", p],
			["https://{Region}.signin.csphome.hci.ic.gov", p],
			["https://{Region}.signin.csphome.adc-e.uk", p],
			["https://{Region}.signin.amazonaws-eusc.eu", p],
			["https://signin-fips.amazonaws-us-gov.com", p],
			["https://{Region}.signin-fips.amazonaws-us-gov.com", p],
			["https://{Region}.signin.{PartitionResult#dnsSuffix}", p],
			[a, "Invalid Configuration: FIPS and custom endpoint are not supported"],
			[a, "Invalid Configuration: Dualstack and custom endpoint are not supported"],
			[k, p],
			["https://signin-fips.{Region}.{PartitionResult#dualStackDnsSuffix}", p],
			[a, "FIPS and DualStack are enabled, but this partition does not support one or both"],
			["https://signin-fips.{Region}.{PartitionResult#dnsSuffix}", p],
			[a, "FIPS is enabled but this partition does not support FIPS"],
			[j, p],
			[a, "DualStack is enabled but this partition does not support DualStack"],
			["https://signin.{Region}.{PartitionResult#dnsSuffix}", p],
			[a, "Invalid Configuration: Missing Region"]
		]
	};
	root = 2;
	nodes = new Int32Array([
		-1,
		1,
		-1,
		0,
		6,
		3,
		2,
		36,
		4,
		4,
		5,
		100000027,
		6,
		100000004,
		100000027,
		1,
		29,
		7,
		2,
		36,
		8,
		3,
		9,
		31,
		4,
		22,
		10,
		5,
		19,
		11,
		7,
		21,
		12,
		8,
		100000007,
		13,
		10,
		100000008,
		14,
		12,
		100000009,
		15,
		13,
		100000010,
		16,
		14,
		100000011,
		17,
		15,
		100000012,
		18,
		16,
		100000013,
		100000016,
		6,
		100000005,
		20,
		7,
		21,
		100000006,
		17,
		100000024,
		100000025,
		6,
		100000004,
		23,
		7,
		27,
		24,
		9,
		100000014,
		25,
		10,
		100000015,
		26,
		11,
		100000022,
		100000023,
		11,
		28,
		100000021,
		17,
		100000020,
		100000021,
		2,
		35,
		30,
		3,
		39,
		31,
		4,
		32,
		100000027,
		6,
		100000004,
		33,
		7,
		100000027,
		34,
		9,
		100000014,
		100000027,
		3,
		39,
		36,
		4,
		38,
		37,
		7,
		100000018,
		100000019,
		6,
		100000004,
		100000017,
		5,
		100000001,
		40,
		8,
		100000002,
		100000003
	]);
	bdd = BinaryDecisionDiagram.from(nodes, root, _data.conditions, _data.results);
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/signin/endpoint/endpointResolver.js
var cache, defaultEndpointResolver;
var init_endpointResolver = __esmMin((() => {
	init_client();
	init_endpoints();
	init_bdd();
	cache = new EndpointCache({
		size: 50,
		params: [
			"Endpoint",
			"IsControlPlane",
			"IsOAuthEndpoint",
			"Region",
			"UseDualStack",
			"UseFIPS"
		]
	});
	defaultEndpointResolver = (endpointParams, context = {}) => {
		return cache.get(endpointParams, () => decideEndpoint(bdd, {
			endpointParams,
			logger: context.logger
		}));
	};
	customEndpointFunctions.aws = awsEndpointFunctions;
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/signin/models/SigninServiceException.js
var SigninServiceException;
var init_SigninServiceException = __esmMin((() => {
	init_client$1();
	SigninServiceException = class SigninServiceException extends ServiceException {
		constructor(options) {
			super(options);
			Object.setPrototypeOf(this, SigninServiceException.prototype);
		}
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/signin/models/errors.js
var AccessDeniedException, InternalServerException, TooManyRequestsError, ValidationException;
var init_errors = __esmMin((() => {
	init_SigninServiceException();
	AccessDeniedException = class AccessDeniedException extends SigninServiceException {
		name = "AccessDeniedException";
		$fault = "client";
		error;
		constructor(opts) {
			super({
				name: "AccessDeniedException",
				$fault: "client",
				...opts
			});
			Object.setPrototypeOf(this, AccessDeniedException.prototype);
			this.error = opts.error;
		}
	};
	InternalServerException = class InternalServerException extends SigninServiceException {
		name = "InternalServerException";
		$fault = "server";
		error;
		constructor(opts) {
			super({
				name: "InternalServerException",
				$fault: "server",
				...opts
			});
			Object.setPrototypeOf(this, InternalServerException.prototype);
			this.error = opts.error;
		}
	};
	TooManyRequestsError = class TooManyRequestsError extends SigninServiceException {
		name = "TooManyRequestsError";
		$fault = "client";
		error;
		constructor(opts) {
			super({
				name: "TooManyRequestsError",
				$fault: "client",
				...opts
			});
			Object.setPrototypeOf(this, TooManyRequestsError.prototype);
			this.error = opts.error;
		}
	};
	ValidationException = class ValidationException extends SigninServiceException {
		name = "ValidationException";
		$fault = "client";
		error;
		constructor(opts) {
			super({
				name: "ValidationException",
				$fault: "client",
				...opts
			});
			Object.setPrototypeOf(this, ValidationException.prototype);
			this.error = opts.error;
		}
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/signin/schemas/schemas_0.js
var _ADE, _AT, _COAT, _COATR, _COATRB, _COATRBr, _COATRr, _COATWIAM, _COATWIAMR, _COATWIAMRr, _ISE, _OAAT, _RT, _TMRE, _VE, _aKI, _aT, _at, _c, _cI, _cV, _co, _e, _eI, _ei, _gT, _gt, _h, _hE, _iT, _jN, _m, _r, _rT, _rU, _s, _sAK, _sT, _se, _tI, _tO, _tT, _tt, n0, _s_registry, SigninServiceException$, n0_registry, AccessDeniedException$, InternalServerException$, TooManyRequestsError$, ValidationException$, errorTypeRegistries, OAuthAccessToken, RefreshToken, AccessToken$, CreateOAuth2TokenRequest$, CreateOAuth2TokenRequestBody$, CreateOAuth2TokenResponse$, CreateOAuth2TokenResponseBody$, CreateOAuth2TokenWithIAMRequest$, CreateOAuth2TokenWithIAMResponse$, CreateOAuth2Token$, CreateOAuth2TokenWithIAM$;
var init_schemas_0 = __esmMin((() => {
	init_schema();
	init_errors();
	init_SigninServiceException();
	_ADE = "AccessDeniedException";
	_AT = "AccessToken";
	_COAT = "CreateOAuth2Token";
	_COATR = "CreateOAuth2TokenRequest";
	_COATRB = "CreateOAuth2TokenRequestBody";
	_COATRBr = "CreateOAuth2TokenResponseBody";
	_COATRr = "CreateOAuth2TokenResponse";
	_COATWIAM = "CreateOAuth2TokenWithIAM";
	_COATWIAMR = "CreateOAuth2TokenWithIAMRequest";
	_COATWIAMRr = "CreateOAuth2TokenWithIAMResponse";
	_ISE = "InternalServerException";
	_OAAT = "OAuthAccessToken";
	_RT = "RefreshToken";
	_TMRE = "TooManyRequestsError";
	_VE = "ValidationException";
	_aKI = "accessKeyId";
	_aT = "accessToken";
	_at = "access_token";
	_c = "client";
	_cI = "clientId";
	_cV = "codeVerifier";
	_co = "code";
	_e = "error";
	_eI = "expiresIn";
	_ei = "expires_in";
	_gT = "grantType";
	_gt = "grant_type";
	_h = "http";
	_hE = "httpError";
	_iT = "idToken";
	_jN = "jsonName";
	_m = "message";
	_r = "resource";
	_rT = "refreshToken";
	_rU = "redirectUri";
	_s = "smithy.ts.sdk.synthetic.com.amazonaws.signin";
	_sAK = "secretAccessKey";
	_sT = "sessionToken";
	_se = "server";
	_tI = "tokenInput";
	_tO = "tokenOutput";
	_tT = "tokenType";
	_tt = "token_type";
	n0 = "com.amazonaws.signin";
	_s_registry = new TypeRegistry(_s);
	SigninServiceException$ = [
		-3,
		_s,
		"SigninServiceException",
		0,
		[],
		[]
	];
	_s_registry.registerError(SigninServiceException$, SigninServiceException);
	n0_registry = new TypeRegistry(n0);
	AccessDeniedException$ = [
		-3,
		n0,
		_ADE,
		{ [_e]: _c },
		[_e, _m],
		[0, 0],
		2
	];
	n0_registry.registerError(AccessDeniedException$, AccessDeniedException);
	InternalServerException$ = [
		-3,
		n0,
		_ISE,
		{
			[_e]: _se,
			[_hE]: 500
		},
		[_e, _m],
		[0, 0],
		2
	];
	n0_registry.registerError(InternalServerException$, InternalServerException);
	TooManyRequestsError$ = [
		-3,
		n0,
		_TMRE,
		{
			[_e]: _c,
			[_hE]: 429
		},
		[_e, _m],
		[0, 0],
		2
	];
	n0_registry.registerError(TooManyRequestsError$, TooManyRequestsError);
	ValidationException$ = [
		-3,
		n0,
		_VE,
		{
			[_e]: _c,
			[_hE]: 400
		},
		[_e, _m],
		[0, 0],
		2
	];
	n0_registry.registerError(ValidationException$, ValidationException);
	errorTypeRegistries = [_s_registry, n0_registry];
	OAuthAccessToken = [
		0,
		n0,
		_OAAT,
		8,
		0
	];
	RefreshToken = [
		0,
		n0,
		_RT,
		8,
		0
	];
	AccessToken$ = [
		3,
		n0,
		_AT,
		8,
		[
			_aKI,
			_sAK,
			_sT
		],
		[
			[0, { [_jN]: _aKI }],
			[0, { [_jN]: _sAK }],
			[0, { [_jN]: _sT }]
		],
		3
	];
	CreateOAuth2TokenRequest$ = [
		3,
		n0,
		_COATR,
		0,
		[_tI],
		[[() => CreateOAuth2TokenRequestBody$, 16]],
		1
	];
	CreateOAuth2TokenRequestBody$ = [
		3,
		n0,
		_COATRB,
		0,
		[
			_cI,
			_gT,
			_co,
			_rU,
			_cV,
			_rT
		],
		[
			[0, { [_jN]: _cI }],
			[0, { [_jN]: _gT }],
			0,
			[0, { [_jN]: _rU }],
			[0, { [_jN]: _cV }],
			[() => RefreshToken, { [_jN]: _rT }]
		],
		2
	];
	CreateOAuth2TokenResponse$ = [
		3,
		n0,
		_COATRr,
		0,
		[_tO],
		[[() => CreateOAuth2TokenResponseBody$, 16]],
		1
	];
	CreateOAuth2TokenResponseBody$ = [
		3,
		n0,
		_COATRBr,
		0,
		[
			_aT,
			_tT,
			_eI,
			_rT,
			_iT
		],
		[
			[() => AccessToken$, { [_jN]: _aT }],
			[0, { [_jN]: _tT }],
			[1, { [_jN]: _eI }],
			[() => RefreshToken, { [_jN]: _rT }],
			[0, { [_jN]: _iT }]
		],
		4
	];
	CreateOAuth2TokenWithIAMRequest$ = [
		3,
		n0,
		_COATWIAMR,
		0,
		[_gT, _r],
		[[0, { [_jN]: _gt }], 0],
		2
	];
	CreateOAuth2TokenWithIAMResponse$ = [
		3,
		n0,
		_COATWIAMRr,
		0,
		[
			_aT,
			_tT,
			_eI
		],
		[
			[() => OAuthAccessToken, { [_jN]: _at }],
			[0, { [_jN]: _tt }],
			[1, { [_jN]: _ei }]
		],
		3
	];
	CreateOAuth2Token$ = [
		9,
		n0,
		_COAT,
		{ [_h]: [
			"POST",
			"/v1/token",
			200
		] },
		() => CreateOAuth2TokenRequest$,
		() => CreateOAuth2TokenResponse$
	];
	CreateOAuth2TokenWithIAM$ = [
		9,
		n0,
		_COATWIAM,
		{ [_h]: [
			"POST",
			"/v1/token?x-amz-client-auth-method=iam",
			200
		] },
		() => CreateOAuth2TokenWithIAMRequest$,
		() => CreateOAuth2TokenWithIAMResponse$
	];
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/signin/runtimeConfig.shared.js
var getRuntimeConfig$3;
var init_runtimeConfig_shared = __esmMin((() => {
	init_httpAuthSchemes();
	init_protocols();
	init_dist_es$13();
	init_checksum();
	init_client$1();
	init_protocols$1();
	init_serde();
	init_httpAuthSchemeProvider();
	init_endpointResolver();
	init_schemas_0();
	getRuntimeConfig$3 = (config) => {
		return {
			apiVersion: "2023-01-01",
			base64Decoder: config?.base64Decoder ?? fromBase64,
			base64Encoder: config?.base64Encoder ?? toBase64$1,
			disableHostPrefix: config?.disableHostPrefix ?? false,
			endpointProvider: config?.endpointProvider ?? defaultEndpointResolver,
			extensions: config?.extensions ?? [],
			httpAuthSchemeProvider: config?.httpAuthSchemeProvider ?? defaultSigninHttpAuthSchemeProvider,
			httpAuthSchemes: config?.httpAuthSchemes ?? [{
				schemeId: "aws.auth#sigv4",
				identityProvider: (ipc) => ipc.getIdentityProvider("aws.auth#sigv4"),
				signer: new AwsSdkSigV4Signer()
			}, {
				schemeId: "smithy.api#noAuth",
				identityProvider: (ipc) => ipc.getIdentityProvider("smithy.api#noAuth") || (async () => ({})),
				signer: new NoAuthSigner()
			}],
			logger: config?.logger ?? new NoOpLogger(),
			protocol: config?.protocol ?? AwsRestJsonProtocol,
			protocolSettings: config?.protocolSettings ?? {
				defaultNamespace: "com.amazonaws.signin",
				errorTypeRegistries,
				version: "2023-01-01",
				serviceTarget: "Signin"
			},
			serviceId: config?.serviceId ?? "Signin",
			sha256: config?.sha256 ?? Sha256Node,
			urlParser: config?.urlParser ?? parseUrl,
			utf8Decoder: config?.utf8Decoder ?? fromUtf8$1,
			utf8Encoder: config?.utf8Encoder ?? toUtf8$1
		};
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/signin/runtimeConfig.js
var getRuntimeConfig$2;
var init_runtimeConfig = __esmMin((() => {
	init_package();
	init_client();
	init_httpAuthSchemes();
	init_client$1();
	init_config$1();
	init_retry$1();
	init_serde();
	init_dist_es$7();
	init_runtimeConfig_shared();
	getRuntimeConfig$2 = (config) => {
		emitWarningIfUnsupportedVersion(process.version);
		const defaultsMode = resolveDefaultsModeConfig(config);
		const defaultConfigProvider = () => defaultsMode().then(loadConfigsForDefaultMode);
		const clientSharedValues = getRuntimeConfig$3(config);
		emitWarningIfUnsupportedVersion$1(process.version);
		const loaderConfig = {
			profile: config?.profile,
			logger: clientSharedValues.logger
		};
		return {
			...clientSharedValues,
			...config,
			runtime: "node",
			defaultsMode,
			authSchemePreference: config?.authSchemePreference ?? loadConfig(NODE_AUTH_SCHEME_PREFERENCE_OPTIONS, loaderConfig),
			bodyLengthChecker: config?.bodyLengthChecker ?? calculateBodyLength,
			defaultUserAgentProvider: config?.defaultUserAgentProvider ?? createDefaultUserAgentProvider({
				serviceId: clientSharedValues.serviceId,
				clientVersion: package_default.version
			}),
			maxAttempts: config?.maxAttempts ?? loadConfig(NODE_MAX_ATTEMPT_CONFIG_OPTIONS, config),
			region: config?.region ?? loadConfig(NODE_REGION_CONFIG_OPTIONS, {
				...NODE_REGION_CONFIG_FILE_OPTIONS,
				...loaderConfig
			}),
			requestHandler: NodeHttpHandler.create(config?.requestHandler ?? defaultConfigProvider),
			retryMode: config?.retryMode ?? loadConfig({
				...NODE_RETRY_MODE_CONFIG_OPTIONS,
				default: async () => (await defaultConfigProvider()).retryMode || DEFAULT_RETRY_MODE
			}, config),
			streamCollector: config?.streamCollector ?? streamCollector,
			useDualstackEndpoint: config?.useDualstackEndpoint ?? loadConfig(NODE_USE_DUALSTACK_ENDPOINT_CONFIG_OPTIONS, loaderConfig),
			useFipsEndpoint: config?.useFipsEndpoint ?? loadConfig(NODE_USE_FIPS_ENDPOINT_CONFIG_OPTIONS, loaderConfig),
			userAgentAppId: config?.userAgentAppId ?? loadConfig(NODE_APP_ID_CONFIG_OPTIONS, loaderConfig)
		};
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/signin/auth/httpAuthExtensionConfiguration.js
var getHttpAuthExtensionConfiguration$1, resolveHttpAuthRuntimeConfig$1;
var init_httpAuthExtensionConfiguration = __esmMin((() => {
	getHttpAuthExtensionConfiguration$1 = (runtimeConfig) => {
		const _httpAuthSchemes = runtimeConfig.httpAuthSchemes;
		let _httpAuthSchemeProvider = runtimeConfig.httpAuthSchemeProvider;
		let _credentials = runtimeConfig.credentials;
		return {
			setHttpAuthScheme(httpAuthScheme) {
				const index = _httpAuthSchemes.findIndex((scheme) => scheme.schemeId === httpAuthScheme.schemeId);
				if (index === -1) _httpAuthSchemes.push(httpAuthScheme);
				else _httpAuthSchemes.splice(index, 1, httpAuthScheme);
			},
			httpAuthSchemes() {
				return _httpAuthSchemes;
			},
			setHttpAuthSchemeProvider(httpAuthSchemeProvider) {
				_httpAuthSchemeProvider = httpAuthSchemeProvider;
			},
			httpAuthSchemeProvider() {
				return _httpAuthSchemeProvider;
			},
			setCredentials(credentials) {
				_credentials = credentials;
			},
			credentials() {
				return _credentials;
			}
		};
	};
	resolveHttpAuthRuntimeConfig$1 = (config) => {
		return {
			httpAuthSchemes: config.httpAuthSchemes(),
			httpAuthSchemeProvider: config.httpAuthSchemeProvider(),
			credentials: config.credentials()
		};
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/signin/runtimeExtensions.js
var resolveRuntimeExtensions$1;
var init_runtimeExtensions = __esmMin((() => {
	init_client();
	init_client$1();
	init_protocols$1();
	init_httpAuthExtensionConfiguration();
	resolveRuntimeExtensions$1 = (runtimeConfig, extensions) => {
		const extensionConfiguration = Object.assign(getAwsRegionExtensionConfiguration(runtimeConfig), getDefaultExtensionConfiguration(runtimeConfig), getHttpHandlerExtensionConfiguration(runtimeConfig), getHttpAuthExtensionConfiguration$1(runtimeConfig));
		extensions.forEach((extension) => extension.configure(extensionConfiguration));
		return Object.assign(runtimeConfig, resolveAwsRegionExtensionConfiguration(extensionConfiguration), resolveDefaultRuntimeConfig(extensionConfiguration), resolveHttpHandlerRuntimeConfig(extensionConfiguration), resolveHttpAuthRuntimeConfig$1(extensionConfiguration));
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/signin/SigninClient.js
var SigninClient;
var init_SigninClient = __esmMin((() => {
	init_client();
	init_dist_es$13();
	init_client$1();
	init_config$1();
	init_endpoints();
	init_protocols$1();
	init_retry$1();
	init_schema();
	init_httpAuthSchemeProvider();
	init_EndpointParameters();
	init_runtimeConfig();
	init_runtimeExtensions();
	SigninClient = class extends Client {
		config;
		constructor(...[configuration]) {
			const _config_0 = getRuntimeConfig$2(configuration || {});
			super(_config_0);
			this.initConfig = _config_0;
			const _config_2 = resolveUserAgentConfig(resolveClientEndpointParameters(_config_0));
			const _config_3 = resolveRetryConfig(_config_2);
			const _config_5 = resolveHostHeaderConfig(resolveRegionConfig(_config_3));
			const _config_6 = resolveEndpointConfig(_config_5);
			const _config_7 = resolveHttpAuthSchemeConfig(_config_6);
			const _config_8 = resolveRuntimeExtensions$1(_config_7, configuration?.extensions || []);
			this.config = _config_8;
			this.middlewareStack.use(getSchemaSerdePlugin(this.config));
			this.middlewareStack.use(getUserAgentPlugin(this.config));
			this.middlewareStack.use(getRetryPlugin(this.config));
			this.middlewareStack.use(getContentLengthPlugin(this.config));
			this.middlewareStack.use(getHostHeaderPlugin(this.config));
			this.middlewareStack.use(getLoggerPlugin(this.config));
			this.middlewareStack.use(getRecursionDetectionPlugin(this.config));
			this.middlewareStack.use(getHttpAuthSchemeEndpointRuleSetPlugin(this.config, {
				httpAuthSchemeParametersProvider: defaultSigninHttpAuthSchemeParametersProvider,
				identityProviderConfigProvider: async (config) => new DefaultIdentityProviderConfig({ "aws.auth#sigv4": config.credentials })
			}));
			this.middlewareStack.use(getHttpSigningPlugin(this.config));
		}
		destroy() {
			super.destroy();
		}
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/signin/commandBuilder.js
var command, _ep0, _ep1, _mw0;
var init_commandBuilder = __esmMin((() => {
	init_client$1();
	init_endpoints();
	init_EndpointParameters();
	command = makeBuilder(commonParams, "Signin", "SigninClient", getEndpointPlugin);
	_ep0 = { IsControlPlane: {
		type: "staticContextParams",
		value: false
	} };
	_ep1 = { IsOAuthEndpoint: {
		type: "staticContextParams",
		value: true
	} };
	_mw0 = (Command, cs, config, o) => [];
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/signin/commands/CreateOAuth2TokenCommand.js
var CreateOAuth2TokenCommand;
var init_CreateOAuth2TokenCommand = __esmMin((() => {
	init_commandBuilder();
	init_schemas_0();
	CreateOAuth2TokenCommand = class extends command(_ep0, _mw0, "CreateOAuth2Token", CreateOAuth2Token$) {};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/signin/commands/CreateOAuth2TokenWithIAMCommand.js
var CreateOAuth2TokenWithIAMCommand;
var init_CreateOAuth2TokenWithIAMCommand = __esmMin((() => {
	init_commandBuilder();
	init_schemas_0();
	CreateOAuth2TokenWithIAMCommand = class extends command(_ep1, _mw0, "CreateOAuth2TokenWithIAM", CreateOAuth2TokenWithIAM$) {};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/signin/Signin.js
var commands, Signin;
var init_Signin = __esmMin((() => {
	init_client$1();
	init_CreateOAuth2TokenCommand();
	init_CreateOAuth2TokenWithIAMCommand();
	init_SigninClient();
	commands = {
		CreateOAuth2TokenCommand,
		CreateOAuth2TokenWithIAMCommand
	};
	Signin = class extends SigninClient {};
	createAggregatedClient(commands, Signin);
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/signin/commands/index.js
var init_commands = __esmMin((() => {
	init_CreateOAuth2TokenCommand();
	init_CreateOAuth2TokenWithIAMCommand();
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/signin/models/enums.js
var OAuth2ErrorCode;
var init_enums = __esmMin((() => {
	OAuth2ErrorCode = {
		AUTHCODE_EXPIRED: "AUTHCODE_EXPIRED",
		CONFLICT: "CONFLICT",
		INSUFFICIENT_PERMISSIONS: "INSUFFICIENT_PERMISSIONS",
		INVALID_REQUEST: "INVALID_REQUEST",
		RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND",
		SERVER_ERROR: "server_error",
		SERVICE_QUOTA_EXCEEDED: "SERVICE_QUOTA_EXCEEDED",
		TOKEN_EXPIRED: "TOKEN_EXPIRED",
		USER_CREDENTIALS_CHANGED: "USER_CREDENTIALS_CHANGED"
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/signin/models/models_0.js
var init_models_0 = __esmMin((() => {}));
//#endregion
//#region ../../node_modules/@aws-sdk/nested-clients/dist-es/submodules/signin/index.js
var signin_exports = /* @__PURE__ */ __exportAll({
	$Command: () => Command,
	AccessDeniedException: () => AccessDeniedException,
	AccessDeniedException$: () => AccessDeniedException$,
	AccessToken$: () => AccessToken$,
	CreateOAuth2Token$: () => CreateOAuth2Token$,
	CreateOAuth2TokenCommand: () => CreateOAuth2TokenCommand,
	CreateOAuth2TokenRequest$: () => CreateOAuth2TokenRequest$,
	CreateOAuth2TokenRequestBody$: () => CreateOAuth2TokenRequestBody$,
	CreateOAuth2TokenResponse$: () => CreateOAuth2TokenResponse$,
	CreateOAuth2TokenResponseBody$: () => CreateOAuth2TokenResponseBody$,
	CreateOAuth2TokenWithIAM$: () => CreateOAuth2TokenWithIAM$,
	CreateOAuth2TokenWithIAMCommand: () => CreateOAuth2TokenWithIAMCommand,
	CreateOAuth2TokenWithIAMRequest$: () => CreateOAuth2TokenWithIAMRequest$,
	CreateOAuth2TokenWithIAMResponse$: () => CreateOAuth2TokenWithIAMResponse$,
	InternalServerException: () => InternalServerException,
	InternalServerException$: () => InternalServerException$,
	OAuth2ErrorCode: () => OAuth2ErrorCode,
	Signin: () => Signin,
	SigninClient: () => SigninClient,
	SigninServiceException: () => SigninServiceException,
	SigninServiceException$: () => SigninServiceException$,
	TooManyRequestsError: () => TooManyRequestsError,
	TooManyRequestsError$: () => TooManyRequestsError$,
	ValidationException: () => ValidationException,
	ValidationException$: () => ValidationException$,
	__Client: () => Client,
	errorTypeRegistries: () => errorTypeRegistries
});
var init_signin = __esmMin((() => {
	init_SigninClient();
	init_Signin();
	init_commands();
	init_client$1();
	init_schemas_0();
	init_enums();
	init_errors();
	init_models_0();
	init_SigninServiceException();
}));
//#endregion
//#region ../../node_modules/@aws-sdk/credential-provider-login/dist-es/LoginCredentialsFetcher.js
var LoginCredentialsFetcher;
var init_LoginCredentialsFetcher = __esmMin((() => {
	init_config$1();
	init_protocols$1();
	LoginCredentialsFetcher = class LoginCredentialsFetcher {
		profileData;
		init;
		callerClientConfig;
		static REFRESH_THRESHOLD = 3e5;
		constructor(profileData, init, callerClientConfig) {
			this.profileData = profileData;
			this.init = init;
			this.callerClientConfig = callerClientConfig;
		}
		async loadCredentials() {
			const token = await this.loadToken();
			if (!token) throw new CredentialsProviderError(`Failed to load a token for session ${this.loginSession}, please re-authenticate using aws login`, {
				tryNextLink: false,
				logger: this.logger
			});
			const accessToken = token.accessToken;
			const now = Date.now();
			if (new Date(accessToken.expiresAt).getTime() - now <= LoginCredentialsFetcher.REFRESH_THRESHOLD) return this.refresh(token);
			return this.toCredentials(token.accessToken);
		}
		get logger() {
			return this.init?.logger;
		}
		get loginSession() {
			return this.profileData.login_session;
		}
		toCredentials(token) {
			return {
				accessKeyId: token.accessKeyId,
				secretAccessKey: token.secretAccessKey,
				sessionToken: token.sessionToken,
				accountId: token.accountId,
				expiration: new Date(token.expiresAt)
			};
		}
		async refresh(token) {
			const diskToken = await this.loadToken().catch(() => token);
			const now = Date.now();
			const diskExpiry = new Date(diskToken.accessToken.expiresAt).getTime();
			const tokenExpiry = new Date(token.accessToken.expiresAt).getTime();
			const freshToken = diskExpiry <= now && tokenExpiry > now ? token : diskToken;
			if (new Date(freshToken.accessToken.expiresAt).getTime() - Date.now() > LoginCredentialsFetcher.REFRESH_THRESHOLD) return this.toCredentials(freshToken.accessToken);
			const { SigninClient, CreateOAuth2TokenCommand } = await Promise.resolve().then(() => (init_signin(), signin_exports));
			const { logger, userAgentAppId } = this.callerClientConfig ?? {};
			const isH2 = (requestHandler) => {
				return requestHandler?.metadata?.handlerProtocol === "h2";
			};
			const requestHandler = isH2(this.callerClientConfig?.requestHandler) ? void 0 : this.callerClientConfig?.requestHandler;
			const client = new SigninClient({
				credentials: {
					accessKeyId: "",
					secretAccessKey: ""
				},
				region: this.profileData.region ?? await this.callerClientConfig?.region?.() ?? process.env.AWS_REGION,
				requestHandler,
				logger,
				userAgentAppId,
				...this.init?.clientConfig
			});
			this.createDPoPInterceptor(client.middlewareStack);
			const commandInput = { tokenInput: {
				clientId: freshToken.clientId,
				refreshToken: freshToken.refreshToken,
				grantType: "refresh_token"
			} };
			try {
				const response = await client.send(new CreateOAuth2TokenCommand(commandInput));
				const { accessKeyId, secretAccessKey, sessionToken } = response.tokenOutput?.accessToken ?? {};
				const { refreshToken, expiresIn } = response.tokenOutput ?? {};
				if (!accessKeyId || !secretAccessKey || !sessionToken || !refreshToken) throw new CredentialsProviderError("Token refresh response missing required fields", {
					logger: this.logger,
					tryNextLink: false
				});
				const expiresInMs = (expiresIn ?? 900) * 1e3;
				const expiration = new Date(Date.now() + expiresInMs);
				const updatedToken = {
					...freshToken,
					accessToken: {
						...freshToken.accessToken,
						accessKeyId,
						secretAccessKey,
						sessionToken,
						expiresAt: expiration.toISOString()
					},
					refreshToken
				};
				await this.saveToken(updatedToken);
				return this.toCredentials(updatedToken.accessToken);
			} catch (error) {
				if (error.name === "AccessDeniedException") {
					const errorType = error.error;
					let message;
					switch (errorType) {
						case "TOKEN_EXPIRED":
							message = "Your session has expired. Please reauthenticate.";
							break;
						case "USER_CREDENTIALS_CHANGED":
							message = "Unable to refresh credentials because of a change in your password. Please reauthenticate with your new password.";
							break;
						case "INSUFFICIENT_PERMISSIONS":
							message = "Unable to refresh credentials due to insufficient permissions. You may be missing permission for the 'CreateOAuth2Token' action.";
							break;
						default: message = `Failed to refresh token: ${String(error)}. Please re-authenticate using \`aws login\``;
					}
					throw new CredentialsProviderError(message, {
						logger: this.logger,
						tryNextLink: false
					});
				}
				if (new Date(freshToken.accessToken.expiresAt).getTime() > Date.now()) {
					this.logger?.warn?.(`Failed to refresh token: ${String(error)}. Using existing token until expiry.`);
					return this.toCredentials(freshToken.accessToken);
				}
				throw new CredentialsProviderError(`Failed to refresh token: ${String(error)}. Please re-authenticate using aws login`, { logger: this.logger });
			}
		}
		async loadToken() {
			const tokenFilePath = this.getTokenFilePath();
			try {
				const tokenData = await promises.readFile(tokenFilePath, "utf8");
				const token = JSON.parse(tokenData);
				const missingFields = [
					"accessToken",
					"clientId",
					"refreshToken",
					"dpopKey"
				].filter((k) => !token[k]);
				if (!token.accessToken?.accountId) missingFields.push("accountId");
				if (missingFields.length > 0) throw new CredentialsProviderError(`Token validation failed, missing fields: ${missingFields.join(", ")}`, {
					logger: this.logger,
					tryNextLink: false
				});
				return token;
			} catch (error) {
				throw new CredentialsProviderError(`Failed to load token from ${tokenFilePath}: ${String(error)}`, {
					logger: this.logger,
					tryNextLink: false
				});
			}
		}
		async saveToken(token) {
			const tokenFilePath = this.getTokenFilePath();
			const directory = dirname(tokenFilePath);
			try {
				await promises.mkdir(directory, { recursive: true });
			} catch (error) {}
			await promises.writeFile(tokenFilePath, JSON.stringify(token, null, 2), "utf8");
		}
		getTokenFilePath() {
			const directory = process.env.AWS_LOGIN_CACHE_DIRECTORY ?? join(homedir(), ".aws", "login", "cache");
			const loginSessionBytes = Buffer.from(this.loginSession, "utf8");
			const loginSessionSha256 = createHash("sha256").update(loginSessionBytes).digest("hex");
			return join(directory, `${loginSessionSha256}.json`);
		}
		derToRawSignature(derSignature) {
			let offset = 2;
			if (derSignature[offset] !== 2) throw new Error("Invalid DER signature");
			offset++;
			const rLength = derSignature[offset++];
			let r = derSignature.subarray(offset, offset + rLength);
			offset += rLength;
			if (derSignature[offset] !== 2) throw new Error("Invalid DER signature");
			offset++;
			const sLength = derSignature[offset++];
			let s = derSignature.subarray(offset, offset + sLength);
			r = r[0] === 0 ? r.subarray(1) : r;
			s = s[0] === 0 ? s.subarray(1) : s;
			const rPadded = Buffer.concat([Buffer.alloc(32 - r.length), r]);
			const sPadded = Buffer.concat([Buffer.alloc(32 - s.length), s]);
			return Buffer.concat([rPadded, sPadded]);
		}
		createDPoPInterceptor(middlewareStack) {
			middlewareStack.add((next) => async (args) => {
				if (HttpRequest.isInstance(args.request)) {
					const request = args.request;
					const actualEndpoint = `${request.protocol}//${request.hostname}${request.port ? `:${request.port}` : ""}${request.path}`;
					const dpop = await this.generateDpop(request.method, actualEndpoint);
					request.headers = {
						...request.headers,
						DPoP: dpop
					};
				}
				return next(args);
			}, {
				step: "finalizeRequest",
				name: "dpopInterceptor",
				override: true
			});
		}
		async generateDpop(method = "POST", endpoint) {
			const token = await this.loadToken();
			try {
				const privateKey = createPrivateKey({
					key: token.dpopKey,
					format: "pem",
					type: "sec1"
				});
				const publicDer = createPublicKey(privateKey).export({
					format: "der",
					type: "spki"
				});
				let pointStart = -1;
				for (let i = 0; i < publicDer.length; i++) if (publicDer[i] === 4) {
					pointStart = i;
					break;
				}
				const x = publicDer.slice(pointStart + 1, pointStart + 33);
				const y = publicDer.slice(pointStart + 33, pointStart + 65);
				const header = {
					alg: "ES256",
					typ: "dpop+jwt",
					jwk: {
						kty: "EC",
						crv: "P-256",
						x: x.toString("base64url"),
						y: y.toString("base64url")
					}
				};
				const payload = {
					jti: crypto.randomUUID(),
					htm: method,
					htu: endpoint,
					iat: Math.floor(Date.now() / 1e3)
				};
				const message = `${Buffer.from(JSON.stringify(header)).toString("base64url")}.${Buffer.from(JSON.stringify(payload)).toString("base64url")}`;
				const asn1Signature = sign("sha256", Buffer.from(message), privateKey);
				return `${message}.${this.derToRawSignature(asn1Signature).toString("base64url")}`;
			} catch (error) {
				throw new CredentialsProviderError(`Failed to generate Dpop proof: ${error instanceof Error ? error.message : String(error)}`, {
					logger: this.logger,
					tryNextLink: false
				});
			}
		}
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/credential-provider-login/dist-es/fromLoginCredentials.js
var fromLoginCredentials;
var init_fromLoginCredentials = __esmMin((() => {
	init_client();
	init_config$1();
	init_LoginCredentialsFetcher();
	fromLoginCredentials = (init) => async ({ callerClientConfig } = {}) => {
		init?.logger?.debug?.("@aws-sdk/credential-providers - fromLoginCredentials");
		const profiles = await parseKnownFiles(init || {});
		const profileName = getProfileName({ profile: init?.profile ?? callerClientConfig?.profile });
		const profile = profiles[profileName];
		if (!profile?.login_session) throw new CredentialsProviderError(`Profile ${profileName} does not contain login_session.`, {
			tryNextLink: true,
			logger: init?.logger
		});
		return setCredentialFeature(await new LoginCredentialsFetcher(profile, init, callerClientConfig).loadCredentials(), "CREDENTIALS_LOGIN", "AD");
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/credential-provider-login/dist-es/index.js
var dist_es_exports$3 = /* @__PURE__ */ __exportAll({ fromLoginCredentials: () => fromLoginCredentials });
var init_dist_es$3 = __esmMin((() => {
	init_fromLoginCredentials();
}));
//#endregion
//#region ../../node_modules/@aws-sdk/credential-provider-ini/dist-es/resolveLoginCredentials.js
var isLoginProfile, resolveLoginCredentials;
var init_resolveLoginCredentials = __esmMin((() => {
	init_client();
	isLoginProfile = (data) => {
		return Boolean(data && data.login_session);
	};
	resolveLoginCredentials = async (profileName, options, callerClientConfig) => {
		const { fromLoginCredentials } = await Promise.resolve().then(() => (init_dist_es$3(), dist_es_exports$3));
		return setCredentialFeature(await fromLoginCredentials({
			...options,
			profile: profileName
		})({ callerClientConfig }), "CREDENTIALS_PROFILE_LOGIN", "AC");
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/credential-provider-process/dist-es/getValidatedProcessCredentials.js
var getValidatedProcessCredentials;
var init_getValidatedProcessCredentials = __esmMin((() => {
	init_client();
	getValidatedProcessCredentials = (profileName, data, profiles) => {
		if (data.Version !== 1) throw Error(`Profile ${profileName} credential_process did not return Version 1.`);
		if (data.AccessKeyId === void 0 || data.SecretAccessKey === void 0) throw Error(`Profile ${profileName} credential_process returned invalid credentials.`);
		if (data.Expiration) {
			const currentTime = /* @__PURE__ */ new Date();
			if (new Date(data.Expiration) < currentTime) throw Error(`Profile ${profileName} credential_process returned expired credentials.`);
		}
		let accountId = data.AccountId;
		if (!accountId && profiles?.[profileName]?.aws_account_id) accountId = profiles[profileName].aws_account_id;
		const credentials = {
			accessKeyId: data.AccessKeyId,
			secretAccessKey: data.SecretAccessKey,
			...data.SessionToken && { sessionToken: data.SessionToken },
			...data.Expiration && { expiration: new Date(data.Expiration) },
			...data.CredentialScope && { credentialScope: data.CredentialScope },
			...accountId && { accountId }
		};
		setCredentialFeature(credentials, "CREDENTIALS_PROCESS", "w");
		return credentials;
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/credential-provider-process/dist-es/resolveProcessCredentials.js
var resolveProcessCredentials$1;
var init_resolveProcessCredentials$1 = __esmMin((() => {
	init_config$1();
	init_getValidatedProcessCredentials();
	resolveProcessCredentials$1 = async (profileName, profiles, logger) => {
		const profile = profiles[profileName];
		if (profiles[profileName]) {
			const credentialProcess = profile["credential_process"];
			if (credentialProcess !== void 0) {
				const execPromise = promisify(externalDataInterceptor?.getTokenRecord?.().exec ?? exec);
				try {
					const { stdout } = await execPromise(credentialProcess);
					let data;
					try {
						data = JSON.parse(stdout.trim());
					} catch {
						throw Error(`Profile ${profileName} credential_process returned invalid JSON.`);
					}
					return getValidatedProcessCredentials(profileName, data, profiles);
				} catch (error) {
					throw new CredentialsProviderError(error.message, { logger });
				}
			} else throw new CredentialsProviderError(`Profile ${profileName} did not contain credential_process.`, { logger });
		} else throw new CredentialsProviderError(`Profile ${profileName} could not be found in shared credentials file.`, { logger });
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/credential-provider-process/dist-es/fromProcess.js
var fromProcess;
var init_fromProcess = __esmMin((() => {
	init_config$1();
	init_resolveProcessCredentials$1();
	fromProcess = (init = {}) => async ({ callerClientConfig } = {}) => {
		init.logger?.debug("@aws-sdk/credential-provider-process - fromProcess");
		const profiles = await parseKnownFiles(init);
		return resolveProcessCredentials$1(getProfileName({ profile: init.profile ?? callerClientConfig?.profile }), profiles, init.logger);
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/credential-provider-process/dist-es/index.js
var dist_es_exports$2 = /* @__PURE__ */ __exportAll({ fromProcess: () => fromProcess });
var init_dist_es$2 = __esmMin((() => {
	init_fromProcess();
}));
//#endregion
//#region ../../node_modules/@aws-sdk/credential-provider-ini/dist-es/resolveProcessCredentials.js
var isProcessProfile, resolveProcessCredentials;
var init_resolveProcessCredentials = __esmMin((() => {
	init_client();
	isProcessProfile = (arg) => Boolean(arg) && typeof arg === "object" && typeof arg.credential_process === "string";
	resolveProcessCredentials = async (options, profile) => {
		const { fromProcess } = await Promise.resolve().then(() => (init_dist_es$2(), dist_es_exports$2));
		return setCredentialFeature(await fromProcess({
			...options,
			profile
		})(), "CREDENTIALS_PROFILE_PROCESS", "v");
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/credential-provider-ini/dist-es/resolveSsoCredentials.js
var resolveSsoCredentials, isSsoProfile;
var init_resolveSsoCredentials = __esmMin((() => {
	init_client();
	resolveSsoCredentials = async (profile, profileData, options = {}, callerClientConfig) => {
		const { fromSSO } = await Promise.resolve().then(() => (init_dist_es$4(), dist_es_exports$4));
		return fromSSO({
			profile,
			logger: options.logger,
			parentClientConfig: options.parentClientConfig,
			clientConfig: options.clientConfig
		})({ callerClientConfig }).then((creds) => {
			if (profileData.sso_session) return setCredentialFeature(creds, "CREDENTIALS_PROFILE_SSO", "r");
			else return setCredentialFeature(creds, "CREDENTIALS_PROFILE_SSO_LEGACY", "t");
		});
	};
	isSsoProfile = (arg) => arg && (typeof arg.sso_start_url === "string" || typeof arg.sso_account_id === "string" || typeof arg.sso_session === "string" || typeof arg.sso_region === "string" || typeof arg.sso_role_name === "string");
}));
//#endregion
//#region ../../node_modules/@aws-sdk/credential-provider-ini/dist-es/resolveStaticCredentials.js
var isStaticCredsProfile, resolveStaticCredentials;
var init_resolveStaticCredentials = __esmMin((() => {
	init_client();
	isStaticCredsProfile = (arg) => Boolean(arg) && typeof arg === "object" && typeof arg.aws_access_key_id === "string" && typeof arg.aws_secret_access_key === "string" && ["undefined", "string"].indexOf(typeof arg.aws_session_token) > -1 && ["undefined", "string"].indexOf(typeof arg.aws_account_id) > -1;
	resolveStaticCredentials = async (profile, options) => {
		options?.logger?.debug("@aws-sdk/credential-provider-ini - resolveStaticCredentials");
		return setCredentialFeature({
			accessKeyId: profile.aws_access_key_id,
			secretAccessKey: profile.aws_secret_access_key,
			sessionToken: profile.aws_session_token,
			...profile.aws_credential_scope && { credentialScope: profile.aws_credential_scope },
			...profile.aws_account_id && { accountId: profile.aws_account_id }
		}, "CREDENTIALS_PROFILE", "n");
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/credential-provider-web-identity/dist-es/fromWebToken.js
var fromWebToken;
var init_fromWebToken = __esmMin((() => {
	fromWebToken = (init) => async (awsIdentityProperties) => {
		init.logger?.debug("@aws-sdk/credential-provider-web-identity - fromWebToken");
		const { roleArn, roleSessionName, webIdentityToken, providerId, policyArns, policy, durationSeconds } = init;
		let { roleAssumerWithWebIdentity } = init;
		if (!roleAssumerWithWebIdentity) {
			const { getDefaultRoleAssumerWithWebIdentity } = await Promise.resolve().then(() => (init_sts(), sts_exports));
			roleAssumerWithWebIdentity = getDefaultRoleAssumerWithWebIdentity({
				...init.clientConfig,
				credentialProviderLogger: init.logger,
				parentClientConfig: {
					...awsIdentityProperties?.callerClientConfig,
					...init.parentClientConfig
				}
			}, init.clientPlugins);
		}
		return roleAssumerWithWebIdentity({
			RoleArn: roleArn,
			RoleSessionName: roleSessionName ?? `aws-sdk-js-session-${Date.now()}`,
			WebIdentityToken: webIdentityToken,
			ProviderId: providerId,
			PolicyArns: policyArns,
			Policy: policy,
			DurationSeconds: durationSeconds
		});
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/credential-provider-web-identity/dist-es/fromTokenFile.js
var ENV_TOKEN_FILE, ENV_ROLE_ARN, ENV_ROLE_SESSION_NAME, fromTokenFile;
var init_fromTokenFile = __esmMin((() => {
	init_client();
	init_config$1();
	init_fromWebToken();
	ENV_TOKEN_FILE = "AWS_WEB_IDENTITY_TOKEN_FILE";
	ENV_ROLE_ARN = "AWS_ROLE_ARN";
	ENV_ROLE_SESSION_NAME = "AWS_ROLE_SESSION_NAME";
	fromTokenFile = (init = {}) => async (awsIdentityProperties) => {
		init.logger?.debug("@aws-sdk/credential-provider-web-identity - fromTokenFile");
		const webIdentityTokenFile = init?.webIdentityTokenFile ?? process.env[ENV_TOKEN_FILE];
		const roleArn = init?.roleArn ?? process.env[ENV_ROLE_ARN];
		const roleSessionName = init?.roleSessionName ?? process.env[ENV_ROLE_SESSION_NAME];
		if (!webIdentityTokenFile || !roleArn) throw new CredentialsProviderError("Web identity configuration not specified", { logger: init.logger });
		const credentials = await fromWebToken({
			...init,
			webIdentityToken: externalDataInterceptor?.getTokenRecord?.()[webIdentityTokenFile] ?? readFileSync(webIdentityTokenFile, { encoding: "ascii" }),
			roleArn,
			roleSessionName
		})(awsIdentityProperties);
		if (webIdentityTokenFile === process.env[ENV_TOKEN_FILE]) setCredentialFeature(credentials, "CREDENTIALS_ENV_VARS_STS_WEB_ID_TOKEN", "h");
		return credentials;
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/credential-provider-web-identity/dist-es/index.js
var dist_es_exports$1 = /* @__PURE__ */ __exportAll({
	fromTokenFile: () => fromTokenFile,
	fromWebToken: () => fromWebToken
});
var init_dist_es$1 = __esmMin((() => {
	init_fromTokenFile();
	init_fromWebToken();
}));
//#endregion
//#region ../../node_modules/@aws-sdk/credential-provider-ini/dist-es/resolveWebIdentityCredentials.js
var isWebIdentityProfile, resolveWebIdentityCredentials;
var init_resolveWebIdentityCredentials = __esmMin((() => {
	init_client();
	isWebIdentityProfile = (arg) => Boolean(arg) && typeof arg === "object" && typeof arg.web_identity_token_file === "string" && typeof arg.role_arn === "string" && ["undefined", "string"].indexOf(typeof arg.role_session_name) > -1;
	resolveWebIdentityCredentials = async (profile, options, callerClientConfig) => {
		const { fromTokenFile } = await Promise.resolve().then(() => (init_dist_es$1(), dist_es_exports$1));
		return setCredentialFeature(await fromTokenFile({
			webIdentityTokenFile: profile.web_identity_token_file,
			roleArn: profile.role_arn,
			roleSessionName: profile.role_session_name,
			roleAssumerWithWebIdentity: options.roleAssumerWithWebIdentity,
			logger: options.logger,
			parentClientConfig: options.parentClientConfig
		})({ callerClientConfig }), "CREDENTIALS_PROFILE_STS_WEB_ID_TOKEN", "q");
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/credential-provider-ini/dist-es/resolveProfileData.js
var resolveProfileData;
var init_resolveProfileData = __esmMin((() => {
	init_config$1();
	init_resolveAssumeRoleCredentials();
	init_resolveLoginCredentials();
	init_resolveProcessCredentials();
	init_resolveSsoCredentials();
	init_resolveStaticCredentials();
	init_resolveWebIdentityCredentials();
	resolveProfileData = async (profileName, profiles, options, callerClientConfig, visitedProfiles = {}, isAssumeRoleRecursiveCall = false) => {
		const data = profiles[profileName];
		if (Object.keys(visitedProfiles).length > 0 && isStaticCredsProfile(data)) return resolveStaticCredentials(data, options);
		if (isAssumeRoleRecursiveCall || isAssumeRoleProfile(data, {
			profile: profileName,
			logger: options.logger
		})) return resolveAssumeRoleCredentials(profileName, profiles, options, callerClientConfig, visitedProfiles, resolveProfileData);
		if (isStaticCredsProfile(data)) return resolveStaticCredentials(data, options);
		if (isWebIdentityProfile(data)) return resolveWebIdentityCredentials(data, options, callerClientConfig);
		if (isProcessProfile(data)) return resolveProcessCredentials(options, profileName);
		if (isSsoProfile(data)) return await resolveSsoCredentials(profileName, data, options, callerClientConfig);
		if (isLoginProfile(data)) return resolveLoginCredentials(profileName, options, callerClientConfig);
		throw new CredentialsProviderError(`Could not resolve credentials using profile: [${profileName}] in configuration/credentials file(s).`, { logger: options.logger });
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/credential-provider-ini/dist-es/fromIni.js
var fromIni;
var init_fromIni = __esmMin((() => {
	init_config$1();
	init_resolveProfileData();
	fromIni = (init = {}) => async ({ callerClientConfig } = {}) => {
		init.logger?.debug("@aws-sdk/credential-provider-ini - fromIni");
		const profiles = await parseKnownFiles(init);
		return resolveProfileData(getProfileName({ profile: init.profile ?? callerClientConfig?.profile }), profiles, init, callerClientConfig);
	};
}));
//#endregion
//#region ../../node_modules/@aws-sdk/credential-provider-ini/dist-es/index.js
var dist_es_exports = /* @__PURE__ */ __exportAll({ fromIni: () => fromIni });
var init_dist_es = __esmMin((() => {
	init_fromIni();
}));
//#endregion
//#region ../../node_modules/@aws-sdk/credential-provider-node/dist-es/defaultProvider.js
init_dist_es$9();
init_config$1();
var multipleCredentialSourceWarningEmitted = false;
var defaultProvider = (init = {}) => memoizeChain([
	async () => {
		if (init.profile ?? process.env["AWS_PROFILE"]) {
			if (process.env["AWS_ACCESS_KEY_ID"] && process.env["AWS_SECRET_ACCESS_KEY"]) {
				if (!multipleCredentialSourceWarningEmitted) {
					(init.logger?.warn && init.logger?.constructor?.name !== "NoOpLogger" ? init.logger.warn.bind(init.logger) : console.warn)(`@aws-sdk/credential-provider-node - defaultProvider::fromEnv WARNING:
    Multiple credential sources detected: 
    Both AWS_PROFILE and the pair AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY static credentials are set.
    This SDK will proceed with the AWS_PROFILE value.
    
    However, a future version may change this behavior to prefer the ENV static credentials.
    Please ensure that your environment only sets either the AWS_PROFILE or the
    AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY pair.
`);
					multipleCredentialSourceWarningEmitted = true;
				}
			}
			throw new CredentialsProviderError("AWS_PROFILE is set, skipping fromEnv provider.", {
				logger: init.logger,
				tryNextLink: true
			});
		}
		init.logger?.debug("@aws-sdk/credential-provider-node - defaultProvider::fromEnv");
		return fromEnv(init)();
	},
	async (awsIdentityProperties) => {
		init.logger?.debug("@aws-sdk/credential-provider-node - defaultProvider::fromSSO");
		const { ssoStartUrl, ssoAccountId, ssoRegion, ssoRoleName, ssoSession } = init;
		if (!ssoStartUrl && !ssoAccountId && !ssoRegion && !ssoRoleName && !ssoSession) throw new CredentialsProviderError("Skipping SSO provider in default chain (inputs do not include SSO fields).", { logger: init.logger });
		const { fromSSO } = await Promise.resolve().then(() => (init_dist_es$4(), dist_es_exports$4));
		return fromSSO(init)(awsIdentityProperties);
	},
	async (awsIdentityProperties) => {
		init.logger?.debug("@aws-sdk/credential-provider-node - defaultProvider::fromIni");
		const { fromIni } = await Promise.resolve().then(() => (init_dist_es(), dist_es_exports));
		return fromIni(init)(awsIdentityProperties);
	},
	async (awsIdentityProperties) => {
		init.logger?.debug("@aws-sdk/credential-provider-node - defaultProvider::fromProcess");
		const { fromProcess } = await Promise.resolve().then(() => (init_dist_es$2(), dist_es_exports$2));
		return fromProcess(init)(awsIdentityProperties);
	},
	async (awsIdentityProperties) => {
		init.logger?.debug("@aws-sdk/credential-provider-node - defaultProvider::fromTokenFile");
		const { fromTokenFile } = await Promise.resolve().then(() => (init_dist_es$1(), dist_es_exports$1));
		return fromTokenFile(init)(awsIdentityProperties);
	},
	async () => {
		init.logger?.debug("@aws-sdk/credential-provider-node - defaultProvider::remoteProvider");
		return (await remoteProvider(init))();
	},
	async () => {
		throw new CredentialsProviderError("Could not load credentials from any providers", {
			tryNextLink: false,
			logger: init.logger
		});
	}
], credentialsTreatedAsExpired);
var credentialsTreatedAsExpired = (credentials) => credentials?.expiration !== void 0 && credentials.expiration.getTime() - Date.now() < 3e5;
//#endregion
//#region ../../node_modules/@aws-sdk/checksums/dist-es/submodules/sha/sha1/Sha1Js.js
init_serde();
var BLOCK = 64;
var DIGEST_LENGTH = 20;
var INIT = new Int32Array([
	1732584193,
	4023233417,
	2562383102,
	271733878,
	3285377520
]);
var K = new Int32Array([
	1518500249,
	1859775393,
	2400959708,
	3395469782
]);
var Sha1Js = class Sha1Js {
	digestLength = DIGEST_LENGTH;
	state = Int32Array.from(INIT);
	w;
	buffer = new Uint8Array(BLOCK);
	bufferLength = 0;
	bytesHashed = 0;
	finished = false;
	inner;
	outer;
	constructor(secret) {
		if (secret) {
			const key = Sha1Js.normalizeKey(secret);
			this.inner = new Sha1Js();
			this.outer = new Sha1Js();
			const pad = /* @__PURE__ */ new Uint8Array(128);
			for (let i = 0; i < BLOCK; ++i) {
				pad[i] = 54 ^ key[i];
				pad[i + BLOCK] = 92 ^ key[i];
			}
			this.inner.update(pad.subarray(0, BLOCK));
			this.outer.update(pad.subarray(BLOCK));
		}
	}
	update(data) {
		if (this.finished) throw new Error("Attempted to update an already finished HMAC.");
		if (this.inner) {
			this.inner.update(data);
			return;
		}
		let pos = 0;
		let { length } = data;
		this.bytesHashed += length;
		if (this.bufferLength > 0) {
			while (length > 0 && this.bufferLength < BLOCK) {
				this.buffer[this.bufferLength++] = data[pos++];
				--length;
			}
			if (this.bufferLength === BLOCK) {
				this.hashBuffer(this.buffer, 0);
				this.bufferLength = 0;
			}
		}
		while (length >= BLOCK) {
			this.hashBuffer(data, pos);
			pos += BLOCK;
			length -= BLOCK;
		}
		while (length > 0) {
			this.buffer[this.bufferLength++] = data[pos++];
			--length;
		}
	}
	async digest() {
		if (this.inner && this.outer) {
			if (this.finished) throw new Error("Attempted to digest an already finished HMAC.");
			this.finished = true;
			const innerDigest = this.inner.digestSync();
			this.outer.update(innerDigest);
			return this.outer.digestSync();
		}
		return this.digestSync();
	}
	reset() {
		this.state = Int32Array.from(INIT);
		this.buffer = new Uint8Array(BLOCK);
		this.bufferLength = 0;
		this.bytesHashed = 0;
	}
	digestSync() {
		const state = this.state.slice();
		const buffer = this.buffer.slice();
		let bufferLength = this.bufferLength;
		const bitsHi = this.bytesHashed / 536870912 | 0;
		const bitsLo = this.bytesHashed << 3;
		buffer[bufferLength++] = 128;
		if (bufferLength > 56) {
			for (let i = bufferLength; i < BLOCK; ++i) buffer[i] = 0;
			this.hashBufferWith(state, buffer, 0);
			bufferLength = 0;
		}
		for (let i = bufferLength; i < 56; ++i) buffer[i] = 0;
		const v = new DataView(buffer.buffer, buffer.byteOffset, BLOCK);
		v.setUint32(56, bitsHi, false);
		v.setUint32(60, bitsLo, false);
		this.hashBufferWith(state, buffer, 0);
		const out = new Uint8Array(DIGEST_LENGTH);
		out[0] = state[0] >>> 24 & 255;
		out[1] = state[0] >>> 16 & 255;
		out[2] = state[0] >>> 8 & 255;
		out[3] = state[0] & 255;
		out[4] = state[1] >>> 24 & 255;
		out[5] = state[1] >>> 16 & 255;
		out[6] = state[1] >>> 8 & 255;
		out[7] = state[1] & 255;
		out[8] = state[2] >>> 24 & 255;
		out[9] = state[2] >>> 16 & 255;
		out[10] = state[2] >>> 8 & 255;
		out[11] = state[2] & 255;
		out[12] = state[3] >>> 24 & 255;
		out[13] = state[3] >>> 16 & 255;
		out[14] = state[3] >>> 8 & 255;
		out[15] = state[3] & 255;
		out[16] = state[4] >>> 24 & 255;
		out[17] = state[4] >>> 16 & 255;
		out[18] = state[4] >>> 8 & 255;
		out[19] = state[4] & 255;
		return out;
	}
	static normalizeKey(secret) {
		const key = toUint8Array(secret);
		if (key.byteLength > BLOCK) {
			const h = new Sha1Js();
			h.update(key);
			const digest = h.digestSync();
			const padded = new Uint8Array(BLOCK);
			padded.set(digest);
			return padded;
		}
		const padded = new Uint8Array(BLOCK);
		padded.set(key);
		return padded;
	}
	hashBuffer(data, offset) {
		this.hashBufferWith(this.state, data, offset);
	}
	hashBufferWith(state, data, offset) {
		const w = this.w ??= /* @__PURE__ */ new Int32Array(80);
		let s0 = state[0], s1 = state[1], s2 = state[2], s3 = state[3], s4 = state[4];
		for (let t = 0; t < 16; ++t) w[t] = (data[offset + t * 4] & 255) << 24 | (data[offset + t * 4 + 1] & 255) << 16 | (data[offset + t * 4 + 2] & 255) << 8 | data[offset + t * 4 + 3] & 255;
		for (let t = 16; t < 80; ++t) {
			const x = w[t - 3] ^ w[t - 8] ^ w[t - 14] ^ w[t - 16];
			w[t] = x << 1 | x >>> 31;
		}
		for (let t = 0; t < 80; ++t) {
			const r = t < 20 ? 0 : t < 40 ? 1 : t < 60 ? 2 : 3;
			const temp = ((s0 << 5 | s0 >>> 27) + (r === 0 ? s1 & s2 ^ ~s1 & s3 : r === 2 ? s1 & s2 ^ s1 & s3 ^ s2 & s3 : s1 ^ s2 ^ s3) | 0) + (s4 + (K[r] + w[t] | 0) | 0) | 0;
			s4 = s3;
			s3 = s2;
			s2 = s1 << 30 | s1 >>> 2;
			s1 = s0;
			s0 = temp;
		}
		state[0] = state[0] + s0 | 0;
		state[1] = state[1] + s1 | 0;
		state[2] = state[2] + s2 | 0;
		state[3] = state[3] + s3 | 0;
		state[4] = state[4] + s4 | 0;
	}
};
var Sha1Node = (() => {
	try {
		createHash("sha1");
		return true;
	} catch {
		return false;
	}
})() ? buildNativeClass() : Sha1Js;
function buildNativeClass() {
	return class Sha1Node {
		digestLength = 20;
		secret;
		hash;
		isHmac;
		finished = false;
		constructor(secret) {
			this.secret = secret;
			this.isHmac = !!secret;
			this.hash = this.createHash();
		}
		update(data) {
			if (this.finished) throw new Error("Attempted to update an already finished hash.");
			this.hash.update(data);
		}
		async digest() {
			let buf;
			if (this.isHmac) {
				this.finished = true;
				buf = this.hash.digest();
			} else buf = this.hash.copy().digest();
			return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
		}
		reset() {
			this.hash = this.createHash();
			this.finished = false;
		}
		createHash() {
			return this.secret ? createHmac("sha1", toBuffer(this.secret)) : createHash("sha1");
		}
	};
}
function toBuffer(data) {
	if (typeof data === "string") return data;
	if (ArrayBuffer.isView(data)) return Buffer.from(data.buffer, data.byteOffset, data.byteLength);
	return Buffer.from(data);
}
//#endregion
//#region ../../node_modules/@aws-sdk/client-s3/dist-es/runtimeConfig.shared.js
init_httpAuthSchemes();
init_dist_es$11();
init_checksum();
init_client$1();
init_protocols$1();
init_serde();
var getRuntimeConfig$1 = (config) => {
	return {
		apiVersion: "2006-03-01",
		base64Decoder: config?.base64Decoder ?? fromBase64,
		base64Encoder: config?.base64Encoder ?? toBase64$1,
		disableHostPrefix: config?.disableHostPrefix ?? false,
		endpointProvider: config?.endpointProvider ?? defaultEndpointResolver$4,
		extensions: config?.extensions ?? [],
		getAwsChunkedEncodingStream: config?.getAwsChunkedEncodingStream ?? getAwsChunkedEncodingStream,
		httpAuthSchemeProvider: config?.httpAuthSchemeProvider ?? defaultS3HttpAuthSchemeProvider,
		httpAuthSchemes: config?.httpAuthSchemes ?? [{
			schemeId: "aws.auth#sigv4",
			identityProvider: (ipc) => ipc.getIdentityProvider("aws.auth#sigv4"),
			signer: new AwsSdkSigV4Signer()
		}, {
			schemeId: "aws.auth#sigv4a",
			identityProvider: (ipc) => ipc.getIdentityProvider("aws.auth#sigv4a"),
			signer: new AwsSdkSigV4ASigner()
		}],
		logger: config?.logger ?? new NoOpLogger(),
		md5: config?.md5 ?? Md5Node,
		protocol: config?.protocol ?? S3RestXmlProtocol,
		protocolSettings: config?.protocolSettings ?? {
			defaultNamespace: "com.amazonaws.s3",
			errorTypeRegistries: errorTypeRegistries$4,
			xmlNamespace: "http://s3.amazonaws.com/doc/2006-03-01/",
			version: "2006-03-01",
			serviceTarget: "AmazonS3"
		},
		sdkStreamMixin: config?.sdkStreamMixin ?? sdkStreamMixin,
		serviceId: config?.serviceId ?? "S3",
		sha1: config?.sha1 ?? Sha1Node,
		sha256: config?.sha256 ?? Sha256Node,
		signerConstructor: config?.signerConstructor ?? SignatureV4MultiRegion,
		signingEscapePath: config?.signingEscapePath ?? false,
		urlParser: config?.urlParser ?? parseUrl,
		useArnRegion: config?.useArnRegion ?? void 0,
		utf8Decoder: config?.utf8Decoder ?? fromUtf8$1,
		utf8Encoder: config?.utf8Encoder ?? toUtf8$1
	};
};
//#endregion
//#region ../../node_modules/@aws-sdk/client-s3/dist-es/runtimeConfig.js
init_client();
init_httpAuthSchemes();
init_checksum();
init_client$1();
init_config$1();
init_event_streams();
init_retry$1();
init_serde();
init_dist_es$7();
var getRuntimeConfig = (config) => {
	emitWarningIfUnsupportedVersion(process.version);
	const defaultsMode = resolveDefaultsModeConfig(config);
	const defaultConfigProvider = () => defaultsMode().then(loadConfigsForDefaultMode);
	const clientSharedValues = getRuntimeConfig$1(config);
	emitWarningIfUnsupportedVersion$1(process.version);
	const loaderConfig = {
		profile: config?.profile,
		logger: clientSharedValues.logger
	};
	return {
		...clientSharedValues,
		...config,
		runtime: "node",
		defaultsMode,
		authSchemePreference: config?.authSchemePreference ?? loadConfig(NODE_AUTH_SCHEME_PREFERENCE_OPTIONS, loaderConfig),
		bodyLengthChecker: config?.bodyLengthChecker ?? calculateBodyLength,
		credentialDefaultProvider: config?.credentialDefaultProvider ?? defaultProvider,
		defaultUserAgentProvider: config?.defaultUserAgentProvider ?? createDefaultUserAgentProvider({
			serviceId: clientSharedValues.serviceId,
			clientVersion: package_default$1.version
		}),
		disableS3ExpressSessionAuth: config?.disableS3ExpressSessionAuth ?? loadConfig(NODE_DISABLE_S3_EXPRESS_SESSION_AUTH_OPTIONS, loaderConfig),
		eventStreamSerdeProvider: config?.eventStreamSerdeProvider ?? eventStreamSerdeProvider,
		maxAttempts: config?.maxAttempts ?? loadConfig(NODE_MAX_ATTEMPT_CONFIG_OPTIONS, config),
		region: config?.region ?? loadConfig(NODE_REGION_CONFIG_OPTIONS, {
			...NODE_REGION_CONFIG_FILE_OPTIONS,
			...loaderConfig
		}),
		requestChecksumCalculation: config?.requestChecksumCalculation ?? loadConfig(NODE_REQUEST_CHECKSUM_CALCULATION_CONFIG_OPTIONS, loaderConfig),
		requestHandler: NodeHttpHandler.create(config?.requestHandler ?? defaultConfigProvider),
		responseChecksumValidation: config?.responseChecksumValidation ?? loadConfig(NODE_RESPONSE_CHECKSUM_VALIDATION_CONFIG_OPTIONS, loaderConfig),
		retryMode: config?.retryMode ?? loadConfig({
			...NODE_RETRY_MODE_CONFIG_OPTIONS,
			default: async () => (await defaultConfigProvider()).retryMode || DEFAULT_RETRY_MODE
		}, config),
		sigv4aSigningRegionSet: config?.sigv4aSigningRegionSet ?? loadConfig(NODE_SIGV4A_CONFIG_OPTIONS, loaderConfig),
		streamCollector: config?.streamCollector ?? streamCollector,
		streamHasher: config?.streamHasher ?? readableStreamHasher,
		useArnRegion: config?.useArnRegion ?? loadConfig(NODE_USE_ARN_REGION_CONFIG_OPTIONS, loaderConfig),
		useDualstackEndpoint: config?.useDualstackEndpoint ?? loadConfig(NODE_USE_DUALSTACK_ENDPOINT_CONFIG_OPTIONS, loaderConfig),
		useFipsEndpoint: config?.useFipsEndpoint ?? loadConfig(NODE_USE_FIPS_ENDPOINT_CONFIG_OPTIONS, loaderConfig),
		userAgentAppId: config?.userAgentAppId ?? loadConfig(NODE_APP_ID_CONFIG_OPTIONS, loaderConfig)
	};
};
//#endregion
//#region ../../node_modules/@aws-sdk/client-s3/dist-es/auth/httpAuthExtensionConfiguration.js
var getHttpAuthExtensionConfiguration = (runtimeConfig) => {
	const _httpAuthSchemes = runtimeConfig.httpAuthSchemes;
	let _httpAuthSchemeProvider = runtimeConfig.httpAuthSchemeProvider;
	let _credentials = runtimeConfig.credentials;
	return {
		setHttpAuthScheme(httpAuthScheme) {
			const index = _httpAuthSchemes.findIndex((scheme) => scheme.schemeId === httpAuthScheme.schemeId);
			if (index === -1) _httpAuthSchemes.push(httpAuthScheme);
			else _httpAuthSchemes.splice(index, 1, httpAuthScheme);
		},
		httpAuthSchemes() {
			return _httpAuthSchemes;
		},
		setHttpAuthSchemeProvider(httpAuthSchemeProvider) {
			_httpAuthSchemeProvider = httpAuthSchemeProvider;
		},
		httpAuthSchemeProvider() {
			return _httpAuthSchemeProvider;
		},
		setCredentials(credentials) {
			_credentials = credentials;
		},
		credentials() {
			return _credentials;
		}
	};
};
var resolveHttpAuthRuntimeConfig = (config) => {
	return {
		httpAuthSchemes: config.httpAuthSchemes(),
		httpAuthSchemeProvider: config.httpAuthSchemeProvider(),
		credentials: config.credentials()
	};
};
//#endregion
//#region ../../node_modules/@aws-sdk/client-s3/dist-es/runtimeExtensions.js
init_client();
init_client$1();
init_protocols$1();
var resolveRuntimeExtensions = (runtimeConfig, extensions) => {
	const extensionConfiguration = Object.assign(getAwsRegionExtensionConfiguration(runtimeConfig), getDefaultExtensionConfiguration(runtimeConfig), getHttpHandlerExtensionConfiguration(runtimeConfig), getHttpAuthExtensionConfiguration(runtimeConfig));
	extensions.forEach((extension) => extension.configure(extensionConfiguration));
	return Object.assign(runtimeConfig, resolveAwsRegionExtensionConfiguration(extensionConfiguration), resolveDefaultRuntimeConfig(extensionConfiguration), resolveHttpHandlerRuntimeConfig(extensionConfiguration), resolveHttpAuthRuntimeConfig(extensionConfiguration));
};
//#endregion
//#region ../../node_modules/@aws-sdk/client-s3/dist-es/S3Client.js
init_client();
init_dist_es$13();
init_client$1();
init_config$1();
init_endpoints();
init_event_streams();
init_protocols$1();
init_retry$1();
init_schema();
var S3Client = class extends Client {
	config;
	constructor(...[configuration]) {
		const _config_0 = getRuntimeConfig(configuration || {});
		super(_config_0);
		this.initConfig = _config_0;
		const _config_3 = resolveFlexibleChecksumsConfig(resolveUserAgentConfig(resolveClientEndpointParameters$4(_config_0)));
		const _config_4 = resolveRetryConfig(_config_3);
		const _config_6 = resolveHostHeaderConfig(resolveRegionConfig(_config_4));
		const _config_7 = resolveEndpointConfig(_config_6);
		const _config_11 = resolveRuntimeExtensions(resolveS3Config(resolveHttpAuthSchemeConfig$4(resolveEventStreamSerdeConfig(_config_7)), { session: [() => this, CreateSessionCommand] }), configuration?.extensions || []);
		this.config = _config_11;
		this.middlewareStack.use(getSchemaSerdePlugin(this.config));
		this.middlewareStack.use(getUserAgentPlugin(this.config));
		this.middlewareStack.use(getRetryPlugin(this.config));
		this.middlewareStack.use(getContentLengthPlugin(this.config));
		this.middlewareStack.use(getHostHeaderPlugin(this.config));
		this.middlewareStack.use(getLoggerPlugin(this.config));
		this.middlewareStack.use(getRecursionDetectionPlugin(this.config));
		this.middlewareStack.use(getHttpAuthSchemeEndpointRuleSetPlugin(this.config, {
			httpAuthSchemeParametersProvider: defaultS3HttpAuthSchemeParametersProvider,
			identityProviderConfigProvider: async (config) => new DefaultIdentityProviderConfig({
				"aws.auth#sigv4": config.credentials,
				"aws.auth#sigv4a": config.credentials
			})
		}));
		this.middlewareStack.use(getHttpSigningPlugin(this.config));
		this.middlewareStack.use(getValidateBucketNamePlugin(this.config));
		this.middlewareStack.use(getAddExpectContinuePlugin(this.config));
		this.middlewareStack.use(getRegionRedirectMiddlewarePlugin(this.config));
		this.middlewareStack.use(getS3ExpressPlugin(this.config));
		this.middlewareStack.use(getS3ExpressHttpSigningPlugin(this.config));
	}
	destroy() {
		super.destroy();
	}
};
//#endregion
//#region ../../node_modules/@aws-sdk/client-s3/dist-es/commands/GetObjectCommand.js
var GetObjectCommand = class extends command$4(_ep0$4, _mw7, "GetObject", GetObject$) {};
//#endregion
//#region ../../node_modules/@aws-sdk/client-s3/dist-es/commands/ListObjectsV2Command.js
var ListObjectsV2Command = class extends command$4(_ep8, _mw0$4, "ListObjectsV2", ListObjectsV2$) {};
//#endregion
//#region ../../node_modules/@aws-sdk/client-s3/dist-es/commands/PutObjectCommand.js
var PutObjectCommand = class extends command$4(_ep0$4, _mw11, "PutObject", PutObject$) {};
//#endregion
//#region src/roundtrip.ts
var BUCKET = "lakehouse";
var GOLD = "gold";
var OTHER = "other";
var SHARED = "shared";
function newClient() {
	return new S3Client({
		region: process.env.AWS_REGION,
		endpoint: process.env.AWS_ENDPOINT_URL_S3,
		forcePathStyle: true,
		credentials: {
			accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
			secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? ""
		},
		requestChecksumCalculation: "WHEN_REQUIRED",
		responseChecksumValidation: "WHEN_REQUIRED"
	});
}
async function streamToString(body) {
	const b = body;
	if (b?.transformToString) return b.transformToString();
	return "";
}
async function handle(ctx, event) {
	const inv = event.data?.inv ?? String(Date.now());
	const key = `${GOLD}/roundtrip-${inv}.txt`;
	const want = `roundtrip-${inv}`;
	const s3 = newClient();
	await s3.send(new PutObjectCommand({
		Bucket: BUCKET,
		Key: key,
		Body: want
	}));
	ctx.log(`s3-roundtrip: PUT ${BUCKET}/${key} ok`);
	const put = true;
	const get = await streamToString((await s3.send(new GetObjectCommand({
		Bucket: BUCKET,
		Key: key
	}))).Body) === want;
	ctx.log(`s3-roundtrip: GET ${BUCKET}/${key} → match=${get}`);
	const keys = ((await s3.send(new ListObjectsV2Command({
		Bucket: BUCKET,
		Prefix: `${GOLD}/`
	}))).Contents ?? []).map((o) => o.Key);
	const list = keys.includes(key) ? keys.length : 0;
	ctx.log(`s3-roundtrip: LIST ${GOLD}/ → ${keys.length} object(s), present=${keys.includes(key)}`);
	let denied = false;
	try {
		await s3.send(new PutObjectCommand({
			Bucket: BUCKET,
			Key: `${OTHER}/x.txt`,
			Body: "nope"
		}));
		ctx.log(`s3-roundtrip: PUT ${OTHER}/x.txt UNEXPECTEDLY allowed — PEP did not deny`);
	} catch (err) {
		const e = err;
		const code = e?.$metadata?.httpStatusCode;
		denied = code === 403 || e?.name === "AccessDenied";
		ctx.log(`s3-roundtrip: PUT ${OTHER}/x.txt denied=${denied} (status=${code}, name=${e?.name})`);
	}
	let granted = false;
	try {
		const gkey = `${SHARED}/granted-${inv}.txt`;
		await s3.send(new PutObjectCommand({
			Bucket: BUCKET,
			Key: gkey,
			Body: want
		}));
		granted = await streamToString((await s3.send(new GetObjectCommand({
			Bucket: BUCKET,
			Key: gkey
		}))).Body) === want;
		ctx.log(`s3-roundtrip: PUT+GET ${gkey} via RolesAssignment grant → granted=${granted}`);
	} catch (err) {
		const e = err;
		ctx.log(`s3-roundtrip: ${SHARED} write via grant FAILED (status=${e?.$metadata?.httpStatusCode}, name=${e?.name})`);
	}
	return {
		put,
		get,
		list,
		denied,
		granted
	};
}
//#endregion
export { handle };
