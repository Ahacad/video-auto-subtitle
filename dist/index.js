var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// node_modules/tsup/assets/cjs_shims.js
var init_cjs_shims = __esm({
  "node_modules/tsup/assets/cjs_shims.js"() {
  }
});

// node_modules/commander/index.js
var require_commander = __commonJS({
  "node_modules/commander/index.js"(exports, module2) {
    init_cjs_shims();
    var EventEmitter = require("events").EventEmitter;
    var spawn = require("child_process").spawn;
    var path = require("path");
    var dirname = path.dirname;
    var basename = path.basename;
    var fs2 = require("fs");
    require("util").inherits(Command2, EventEmitter);
    exports = module2.exports = new Command2();
    exports.Command = Command2;
    exports.Option = Option;
    function Option(flags, description) {
      this.flags = flags;
      this.required = flags.indexOf("<") >= 0;
      this.optional = flags.indexOf("[") >= 0;
      this.mandatory = false;
      this.negate = flags.indexOf("-no-") !== -1;
      flags = flags.split(/[ ,|]+/);
      if (flags.length > 1 && !/^[[<]/.test(flags[1]))
        this.short = flags.shift();
      this.long = flags.shift();
      this.description = description || "";
    }
    Option.prototype.name = function() {
      return this.long.replace(/^--/, "");
    };
    Option.prototype.attributeName = function() {
      return camelcase(this.name().replace(/^no-/, ""));
    };
    Option.prototype.is = function(arg) {
      return this.short === arg || this.long === arg;
    };
    var CommanderError = class extends Error {
      constructor(exitCode, code, message) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
        this.code = code;
        this.exitCode = exitCode;
      }
    };
    exports.CommanderError = CommanderError;
    function Command2(name) {
      this.commands = [];
      this.options = [];
      this._execs = /* @__PURE__ */ new Set();
      this._allowUnknownOption = false;
      this._args = [];
      this._name = name || "";
      this._optionValues = {};
      this._storeOptionsAsProperties = true;
      this._passCommandToAction = true;
      this._actionResults = [];
      this._helpFlags = "-h, --help";
      this._helpDescription = "output usage information";
      this._helpShortFlag = "-h";
      this._helpLongFlag = "--help";
    }
    Command2.prototype.command = function(nameAndArgs, actionOptsOrExecDesc, execOpts) {
      var desc = actionOptsOrExecDesc;
      var opts = execOpts;
      if (typeof desc === "object" && desc !== null) {
        opts = desc;
        desc = null;
      }
      opts = opts || {};
      var args = nameAndArgs.split(/ +/);
      var cmd = new Command2(args.shift());
      if (desc) {
        cmd.description(desc);
        this.executables = true;
        this._execs.add(cmd._name);
        if (opts.isDefault)
          this.defaultExecutable = cmd._name;
      }
      cmd._noHelp = !!opts.noHelp;
      cmd._helpFlags = this._helpFlags;
      cmd._helpDescription = this._helpDescription;
      cmd._helpShortFlag = this._helpShortFlag;
      cmd._helpLongFlag = this._helpLongFlag;
      cmd._exitCallback = this._exitCallback;
      cmd._storeOptionsAsProperties = this._storeOptionsAsProperties;
      cmd._passCommandToAction = this._passCommandToAction;
      cmd._executableFile = opts.executableFile;
      this.commands.push(cmd);
      cmd.parseExpectedArgs(args);
      cmd.parent = this;
      if (desc)
        return this;
      return cmd;
    };
    Command2.prototype.arguments = function(desc) {
      return this.parseExpectedArgs(desc.split(/ +/));
    };
    Command2.prototype.addImplicitHelpCommand = function() {
      this.command("help [cmd]", "display help for [cmd]");
    };
    Command2.prototype.parseExpectedArgs = function(args) {
      if (!args.length)
        return;
      var self = this;
      args.forEach(function(arg) {
        var argDetails = {
          required: false,
          name: "",
          variadic: false
        };
        switch (arg[0]) {
          case "<":
            argDetails.required = true;
            argDetails.name = arg.slice(1, -1);
            break;
          case "[":
            argDetails.name = arg.slice(1, -1);
            break;
        }
        if (argDetails.name.length > 3 && argDetails.name.slice(-3) === "...") {
          argDetails.variadic = true;
          argDetails.name = argDetails.name.slice(0, -3);
        }
        if (argDetails.name) {
          self._args.push(argDetails);
        }
      });
      return this;
    };
    Command2.prototype.exitOverride = function(fn) {
      if (fn) {
        this._exitCallback = fn;
      } else {
        this._exitCallback = function(err) {
          if (err.code !== "commander.executeSubCommandAsync") {
            throw err;
          } else {
          }
        };
      }
      return this;
    };
    Command2.prototype._exit = function(exitCode, code, message) {
      if (this._exitCallback) {
        this._exitCallback(new CommanderError(exitCode, code, message));
      }
      process.exit(exitCode);
    };
    Command2.prototype.action = function(fn) {
      var self = this;
      var listener = function(args, unknown) {
        args = args || [];
        unknown = unknown || [];
        var parsed = self.parseOptions(unknown);
        outputHelpIfRequested(self, parsed.unknown);
        self._checkForMissingMandatoryOptions();
        if (parsed.unknown.length > 0) {
          self.unknownOption(parsed.unknown[0]);
        }
        if (parsed.args.length)
          args = parsed.args.concat(args);
        self._args.forEach(function(arg, i) {
          if (arg.required && args[i] == null) {
            self.missingArgument(arg.name);
          } else if (arg.variadic) {
            if (i !== self._args.length - 1) {
              self.variadicArgNotLast(arg.name);
            }
            args[i] = args.splice(i);
          }
        });
        var expectedArgsCount = self._args.length;
        var actionArgs = args.slice(0, expectedArgsCount);
        if (self._passCommandToAction) {
          actionArgs[expectedArgsCount] = self;
        } else {
          actionArgs[expectedArgsCount] = self.opts();
        }
        if (args.length > expectedArgsCount) {
          actionArgs.push(args.slice(expectedArgsCount));
        }
        const actionResult = fn.apply(self, actionArgs);
        let rootCommand = self;
        while (rootCommand.parent) {
          rootCommand = rootCommand.parent;
        }
        rootCommand._actionResults.push(actionResult);
      };
      var parent = this.parent || this;
      var name = parent === this ? "*" : this._name;
      parent.on("command:" + name, listener);
      if (this._alias)
        parent.on("command:" + this._alias, listener);
      return this;
    };
    Command2.prototype._optionEx = function(config, flags, description, fn, defaultValue) {
      var self = this, option = new Option(flags, description), oname = option.name(), name = option.attributeName();
      option.mandatory = !!config.mandatory;
      if (typeof fn !== "function") {
        if (fn instanceof RegExp) {
          var regex = fn;
          fn = function(val, def) {
            var m = regex.exec(val);
            return m ? m[0] : def;
          };
        } else {
          defaultValue = fn;
          fn = null;
        }
      }
      if (option.negate || option.optional || option.required || typeof defaultValue === "boolean") {
        if (option.negate) {
          const positiveLongFlag = option.long.replace(/^--no-/, "--");
          defaultValue = self.optionFor(positiveLongFlag) ? self._getOptionValue(name) : true;
        }
        if (defaultValue !== void 0) {
          self._setOptionValue(name, defaultValue);
          option.defaultValue = defaultValue;
        }
      }
      this.options.push(option);
      this.on("option:" + oname, function(val) {
        if (val !== null && fn) {
          val = fn(val, self._getOptionValue(name) === void 0 ? defaultValue : self._getOptionValue(name));
        }
        if (typeof self._getOptionValue(name) === "boolean" || typeof self._getOptionValue(name) === "undefined") {
          if (val == null) {
            self._setOptionValue(name, option.negate ? false : defaultValue || true);
          } else {
            self._setOptionValue(name, val);
          }
        } else if (val !== null) {
          self._setOptionValue(name, option.negate ? false : val);
        }
      });
      return this;
    };
    Command2.prototype.option = function(flags, description, fn, defaultValue) {
      return this._optionEx({}, flags, description, fn, defaultValue);
    };
    Command2.prototype.requiredOption = function(flags, description, fn, defaultValue) {
      return this._optionEx({ mandatory: true }, flags, description, fn, defaultValue);
    };
    Command2.prototype.allowUnknownOption = function(arg) {
      this._allowUnknownOption = arguments.length === 0 || arg;
      return this;
    };
    Command2.prototype.storeOptionsAsProperties = function(value) {
      this._storeOptionsAsProperties = value === void 0 || value;
      if (this.options.length) {
        console.error("Commander usage error: call storeOptionsAsProperties before adding options");
      }
      return this;
    };
    Command2.prototype.passCommandToAction = function(value) {
      this._passCommandToAction = value === void 0 || value;
      return this;
    };
    Command2.prototype._setOptionValue = function(key, value) {
      if (this._storeOptionsAsProperties) {
        this[key] = value;
      } else {
        this._optionValues[key] = value;
      }
    };
    Command2.prototype._getOptionValue = function(key) {
      if (this._storeOptionsAsProperties) {
        return this[key];
      }
      return this._optionValues[key];
    };
    Command2.prototype.parse = function(argv) {
      if (this.executables)
        this.addImplicitHelpCommand();
      this.rawArgs = argv;
      this._name = this._name || basename(argv[1], ".js");
      if (this.executables && argv.length < 3 && !this.defaultExecutable) {
        argv.push(this._helpLongFlag);
      }
      var normalized = this.normalize(argv.slice(2));
      var parsed = this.parseOptions(normalized);
      var args = this.args = parsed.args;
      var result = this.parseArgs(this.args, parsed.unknown);
      if (args[0] === "help" && args.length === 1)
        this.help();
      if (args[0] === "help") {
        args[0] = args[1];
        args[1] = this._helpLongFlag;
      } else {
        this._checkForMissingMandatoryOptions();
      }
      var name = result.args[0];
      var subCommand = null;
      if (name) {
        subCommand = this.commands.find(function(command) {
          return command._name === name;
        });
      }
      if (!subCommand && name) {
        subCommand = this.commands.find(function(command) {
          return command.alias() === name;
        });
        if (subCommand) {
          name = subCommand._name;
          args[0] = name;
        }
      }
      if (!subCommand && this.defaultExecutable) {
        name = this.defaultExecutable;
        args.unshift(name);
        subCommand = this.commands.find(function(command) {
          return command._name === name;
        });
      }
      if (this._execs.has(name)) {
        return this.executeSubCommand(argv, args, parsed.unknown, subCommand ? subCommand._executableFile : void 0);
      }
      return result;
    };
    Command2.prototype.parseAsync = function(argv) {
      this.parse(argv);
      return Promise.all(this._actionResults);
    };
    Command2.prototype.executeSubCommand = function(argv, args, unknown, executableFile) {
      args = args.concat(unknown);
      if (!args.length)
        this.help();
      var isExplicitJS = false;
      var pm = argv[1];
      var bin = basename(pm, path.extname(pm)) + "-" + args[0];
      if (executableFile != null) {
        bin = executableFile;
        var executableExt = path.extname(executableFile);
        isExplicitJS = executableExt === ".js" || executableExt === ".ts" || executableExt === ".mjs";
      }
      var baseDir;
      var resolvedLink = fs2.realpathSync(pm);
      baseDir = dirname(resolvedLink);
      var localBin = path.join(baseDir, bin);
      if (exists(localBin + ".js")) {
        bin = localBin + ".js";
        isExplicitJS = true;
      } else if (exists(localBin + ".ts")) {
        bin = localBin + ".ts";
        isExplicitJS = true;
      } else if (exists(localBin + ".mjs")) {
        bin = localBin + ".mjs";
        isExplicitJS = true;
      } else if (exists(localBin)) {
        bin = localBin;
      }
      args = args.slice(1);
      var proc;
      if (process.platform !== "win32") {
        if (isExplicitJS) {
          args.unshift(bin);
          args = incrementNodeInspectorPort(process.execArgv).concat(args);
          proc = spawn(process.argv[0], args, { stdio: "inherit" });
        } else {
          proc = spawn(bin, args, { stdio: "inherit" });
        }
      } else {
        args.unshift(bin);
        args = incrementNodeInspectorPort(process.execArgv).concat(args);
        proc = spawn(process.execPath, args, { stdio: "inherit" });
      }
      var signals = ["SIGUSR1", "SIGUSR2", "SIGTERM", "SIGINT", "SIGHUP"];
      signals.forEach(function(signal) {
        process.on(signal, function() {
          if (proc.killed === false && proc.exitCode === null) {
            proc.kill(signal);
          }
        });
      });
      const exitCallback = this._exitCallback;
      if (!exitCallback) {
        proc.on("close", process.exit.bind(process));
      } else {
        proc.on("close", () => {
          exitCallback(new CommanderError(process.exitCode || 0, "commander.executeSubCommandAsync", "(close)"));
        });
      }
      proc.on("error", function(err) {
        if (err.code === "ENOENT") {
          console.error("error: %s(1) does not exist, try --help", bin);
        } else if (err.code === "EACCES") {
          console.error("error: %s(1) not executable. try chmod or run with root", bin);
        }
        if (!exitCallback) {
          process.exit(1);
        } else {
          const wrappedError = new CommanderError(1, "commander.executeSubCommandAsync", "(error)");
          wrappedError.nestedError = err;
          exitCallback(wrappedError);
        }
      });
      this.runningCommand = proc;
    };
    Command2.prototype.normalize = function(args) {
      var ret = [], arg, lastOpt, index, short, opt;
      for (var i = 0, len = args.length; i < len; ++i) {
        arg = args[i];
        if (i > 0) {
          lastOpt = this.optionFor(args[i - 1]);
        }
        if (arg === "--") {
          ret = ret.concat(args.slice(i));
          break;
        } else if (lastOpt && lastOpt.required) {
          ret.push(arg);
        } else if (arg.length > 2 && arg[0] === "-" && arg[1] !== "-") {
          short = arg.slice(0, 2);
          opt = this.optionFor(short);
          if (opt && (opt.required || opt.optional)) {
            ret.push(short);
            ret.push(arg.slice(2));
          } else {
            arg.slice(1).split("").forEach(function(c) {
              ret.push("-" + c);
            });
          }
        } else if (/^--/.test(arg) && ~(index = arg.indexOf("="))) {
          ret.push(arg.slice(0, index), arg.slice(index + 1));
        } else {
          ret.push(arg);
        }
      }
      return ret;
    };
    Command2.prototype.parseArgs = function(args, unknown) {
      var name;
      if (args.length) {
        name = args[0];
        if (this.listeners("command:" + name).length) {
          this.emit("command:" + args.shift(), args, unknown);
        } else {
          this.emit("command:*", args, unknown);
        }
      } else {
        outputHelpIfRequested(this, unknown);
        if (unknown.length > 0 && !this.defaultExecutable) {
          this.unknownOption(unknown[0]);
        }
        if (this.commands.length === 0 && this._args.filter(function(a) {
          return a.required;
        }).length === 0) {
          this.emit("command:*");
        }
      }
      return this;
    };
    Command2.prototype.optionFor = function(arg) {
      for (var i = 0, len = this.options.length; i < len; ++i) {
        if (this.options[i].is(arg)) {
          return this.options[i];
        }
      }
    };
    Command2.prototype._checkForMissingMandatoryOptions = function() {
      for (var cmd = this; cmd; cmd = cmd.parent) {
        cmd.options.forEach((anOption) => {
          if (anOption.mandatory && cmd._getOptionValue(anOption.attributeName()) === void 0) {
            cmd.missingMandatoryOptionValue(anOption);
          }
        });
      }
    };
    Command2.prototype.parseOptions = function(argv) {
      var args = [], len = argv.length, literal, option, arg;
      var unknownOptions = [];
      for (var i = 0; i < len; ++i) {
        arg = argv[i];
        if (literal) {
          args.push(arg);
          continue;
        }
        if (arg === "--") {
          literal = true;
          continue;
        }
        option = this.optionFor(arg);
        if (option) {
          if (option.required) {
            arg = argv[++i];
            if (arg == null)
              return this.optionMissingArgument(option);
            this.emit("option:" + option.name(), arg);
          } else if (option.optional) {
            arg = argv[i + 1];
            if (arg == null || arg[0] === "-" && arg !== "-") {
              arg = null;
            } else {
              ++i;
            }
            this.emit("option:" + option.name(), arg);
          } else {
            this.emit("option:" + option.name());
          }
          continue;
        }
        if (arg.length > 1 && arg[0] === "-") {
          unknownOptions.push(arg);
          if (i + 1 < argv.length && (argv[i + 1][0] !== "-" || argv[i + 1] === "-")) {
            unknownOptions.push(argv[++i]);
          }
          continue;
        }
        args.push(arg);
      }
      return { args, unknown: unknownOptions };
    };
    Command2.prototype.opts = function() {
      if (this._storeOptionsAsProperties) {
        var result = {}, len = this.options.length;
        for (var i = 0; i < len; i++) {
          var key = this.options[i].attributeName();
          result[key] = key === this._versionOptionName ? this._version : this[key];
        }
        return result;
      }
      return this._optionValues;
    };
    Command2.prototype.missingArgument = function(name) {
      const message = `error: missing required argument '${name}'`;
      console.error(message);
      this._exit(1, "commander.missingArgument", message);
    };
    Command2.prototype.optionMissingArgument = function(option, flag) {
      let message;
      if (flag) {
        message = `error: option '${option.flags}' argument missing, got '${flag}'`;
      } else {
        message = `error: option '${option.flags}' argument missing`;
      }
      console.error(message);
      this._exit(1, "commander.optionMissingArgument", message);
    };
    Command2.prototype.missingMandatoryOptionValue = function(option) {
      const message = `error: required option '${option.flags}' not specified`;
      console.error(message);
      this._exit(1, "commander.missingMandatoryOptionValue", message);
    };
    Command2.prototype.unknownOption = function(flag) {
      if (this._allowUnknownOption)
        return;
      const message = `error: unknown option '${flag}'`;
      console.error(message);
      this._exit(1, "commander.unknownOption", message);
    };
    Command2.prototype.variadicArgNotLast = function(name) {
      const message = `error: variadic arguments must be last '${name}'`;
      console.error(message);
      this._exit(1, "commander.variadicArgNotLast", message);
    };
    Command2.prototype.version = function(str, flags, description) {
      if (arguments.length === 0)
        return this._version;
      this._version = str;
      flags = flags || "-V, --version";
      description = description || "output the version number";
      var versionOption = new Option(flags, description);
      this._versionOptionName = versionOption.long.substr(2) || "version";
      this.options.push(versionOption);
      var self = this;
      this.on("option:" + this._versionOptionName, function() {
        process.stdout.write(str + "\n");
        self._exit(0, "commander.version", str);
      });
      return this;
    };
    Command2.prototype.description = function(str, argsDescription) {
      if (arguments.length === 0)
        return this._description;
      this._description = str;
      this._argsDescription = argsDescription;
      return this;
    };
    Command2.prototype.alias = function(alias) {
      var command = this;
      if (this.commands.length !== 0) {
        command = this.commands[this.commands.length - 1];
      }
      if (arguments.length === 0)
        return command._alias;
      if (alias === command._name)
        throw new Error("Command alias can't be the same as its name");
      command._alias = alias;
      return this;
    };
    Command2.prototype.usage = function(str) {
      var args = this._args.map(function(arg) {
        return humanReadableArgName(arg);
      });
      var usage = "[options]" + (this.commands.length ? " [command]" : "") + (this._args.length ? " " + args.join(" ") : "");
      if (arguments.length === 0)
        return this._usage || usage;
      this._usage = str;
      return this;
    };
    Command2.prototype.name = function(str) {
      if (arguments.length === 0)
        return this._name;
      this._name = str;
      return this;
    };
    Command2.prototype.prepareCommands = function() {
      return this.commands.filter(function(cmd) {
        return !cmd._noHelp;
      }).map(function(cmd) {
        var args = cmd._args.map(function(arg) {
          return humanReadableArgName(arg);
        }).join(" ");
        return [
          cmd._name + (cmd._alias ? "|" + cmd._alias : "") + (cmd.options.length ? " [options]" : "") + (args ? " " + args : ""),
          cmd._description
        ];
      });
    };
    Command2.prototype.largestCommandLength = function() {
      var commands = this.prepareCommands();
      return commands.reduce(function(max, command) {
        return Math.max(max, command[0].length);
      }, 0);
    };
    Command2.prototype.largestOptionLength = function() {
      var options2 = [].slice.call(this.options);
      options2.push({
        flags: this._helpFlags
      });
      return options2.reduce(function(max, option) {
        return Math.max(max, option.flags.length);
      }, 0);
    };
    Command2.prototype.largestArgLength = function() {
      return this._args.reduce(function(max, arg) {
        return Math.max(max, arg.name.length);
      }, 0);
    };
    Command2.prototype.padWidth = function() {
      var width = this.largestOptionLength();
      if (this._argsDescription && this._args.length) {
        if (this.largestArgLength() > width) {
          width = this.largestArgLength();
        }
      }
      if (this.commands && this.commands.length) {
        if (this.largestCommandLength() > width) {
          width = this.largestCommandLength();
        }
      }
      return width;
    };
    Command2.prototype.optionHelp = function() {
      var width = this.padWidth();
      var columns = process.stdout.columns || 80;
      var descriptionWidth = columns - width - 4;
      return this.options.map(function(option) {
        const fullDesc = option.description + (!option.negate && option.defaultValue !== void 0 ? " (default: " + JSON.stringify(option.defaultValue) + ")" : "");
        return pad(option.flags, width) + "  " + optionalWrap(fullDesc, descriptionWidth, width + 2);
      }).concat([pad(this._helpFlags, width) + "  " + optionalWrap(this._helpDescription, descriptionWidth, width + 2)]).join("\n");
    };
    Command2.prototype.commandHelp = function() {
      if (!this.commands.length)
        return "";
      var commands = this.prepareCommands();
      var width = this.padWidth();
      var columns = process.stdout.columns || 80;
      var descriptionWidth = columns - width - 4;
      return [
        "Commands:",
        commands.map(function(cmd) {
          var desc = cmd[1] ? "  " + cmd[1] : "";
          return (desc ? pad(cmd[0], width) : cmd[0]) + optionalWrap(desc, descriptionWidth, width + 2);
        }).join("\n").replace(/^/gm, "  "),
        ""
      ].join("\n");
    };
    Command2.prototype.helpInformation = function() {
      var desc = [];
      if (this._description) {
        desc = [
          this._description,
          ""
        ];
        var argsDescription = this._argsDescription;
        if (argsDescription && this._args.length) {
          var width = this.padWidth();
          var columns = process.stdout.columns || 80;
          var descriptionWidth = columns - width - 5;
          desc.push("Arguments:");
          desc.push("");
          this._args.forEach(function(arg) {
            desc.push("  " + pad(arg.name, width) + "  " + wrap(argsDescription[arg.name], descriptionWidth, width + 4));
          });
          desc.push("");
        }
      }
      var cmdName = this._name;
      if (this._alias) {
        cmdName = cmdName + "|" + this._alias;
      }
      var parentCmdNames = "";
      for (var parentCmd = this.parent; parentCmd; parentCmd = parentCmd.parent) {
        parentCmdNames = parentCmd.name() + " " + parentCmdNames;
      }
      var usage = [
        "Usage: " + parentCmdNames + cmdName + " " + this.usage(),
        ""
      ];
      var cmds = [];
      var commandHelp = this.commandHelp();
      if (commandHelp)
        cmds = [commandHelp];
      var options2 = [
        "Options:",
        "" + this.optionHelp().replace(/^/gm, "  "),
        ""
      ];
      return usage.concat(desc).concat(options2).concat(cmds).join("\n");
    };
    Command2.prototype.outputHelp = function(cb) {
      if (!cb) {
        cb = function(passthru) {
          return passthru;
        };
      }
      const cbOutput = cb(this.helpInformation());
      if (typeof cbOutput !== "string" && !Buffer.isBuffer(cbOutput)) {
        throw new Error("outputHelp callback must return a string or a Buffer");
      }
      process.stdout.write(cbOutput);
      this.emit(this._helpLongFlag);
    };
    Command2.prototype.helpOption = function(flags, description) {
      this._helpFlags = flags || this._helpFlags;
      this._helpDescription = description || this._helpDescription;
      var splitFlags = this._helpFlags.split(/[ ,|]+/);
      if (splitFlags.length > 1)
        this._helpShortFlag = splitFlags.shift();
      this._helpLongFlag = splitFlags.shift();
      return this;
    };
    Command2.prototype.help = function(cb) {
      this.outputHelp(cb);
      this._exit(process.exitCode || 0, "commander.help", "(outputHelp)");
    };
    function camelcase(flag) {
      return flag.split("-").reduce(function(str, word) {
        return str + word[0].toUpperCase() + word.slice(1);
      });
    }
    function pad(str, width) {
      var len = Math.max(0, width - str.length);
      return str + Array(len + 1).join(" ");
    }
    function wrap(str, width, indent) {
      var regex = new RegExp(".{1," + (width - 1) + "}([\\s\u200B]|$)|[^\\s\u200B]+?([\\s\u200B]|$)", "g");
      var lines = str.match(regex) || [];
      return lines.map(function(line, i) {
        if (line.slice(-1) === "\n") {
          line = line.slice(0, line.length - 1);
        }
        return (i > 0 && indent ? Array(indent + 1).join(" ") : "") + line.trimRight();
      }).join("\n");
    }
    function optionalWrap(str, width, indent) {
      if (str.match(/[\n]\s+/))
        return str;
      const minWidth = 40;
      if (width < minWidth)
        return str;
      return wrap(str, width, indent);
    }
    function outputHelpIfRequested(cmd, options2) {
      options2 = options2 || [];
      for (var i = 0; i < options2.length; i++) {
        if (options2[i] === cmd._helpLongFlag || options2[i] === cmd._helpShortFlag) {
          cmd.outputHelp();
          cmd._exit(0, "commander.helpDisplayed", "(outputHelp)");
        }
      }
    }
    function humanReadableArgName(arg) {
      var nameOutput = arg.name + (arg.variadic === true ? "..." : "");
      return arg.required ? "<" + nameOutput + ">" : "[" + nameOutput + "]";
    }
    function exists(file) {
      try {
        if (fs2.statSync(file).isFile()) {
          return true;
        }
      } catch (e) {
        return false;
      }
    }
    function incrementNodeInspectorPort(args) {
      return args.map((arg) => {
        var result = arg;
        if (arg.indexOf("--inspect") === 0) {
          var debugOption;
          var debugHost = "127.0.0.1";
          var debugPort = "9229";
          var match;
          if ((match = arg.match(/^(--inspect(-brk)?)$/)) !== null) {
            debugOption = match[1];
          } else if ((match = arg.match(/^(--inspect(-brk|-port)?)=([^:]+)$/)) !== null) {
            debugOption = match[1];
            if (/^\d+$/.test(match[3])) {
              debugPort = match[3];
            } else {
              debugHost = match[3];
            }
          } else if ((match = arg.match(/^(--inspect(-brk|-port)?)=([^:]+):(\d+)$/)) !== null) {
            debugOption = match[1];
            debugHost = match[3];
            debugPort = match[4];
          }
          if (debugOption && debugPort !== "0") {
            result = `${debugOption}=${debugHost}:${parseInt(debugPort) + 1}`;
          }
        }
        return result;
      });
    }
  }
});

// index.ts
init_cjs_shims();
var execSync = require("child_process").execSync;
var exec = require("child_process").exec;
var fs = require("fs");
var { Command } = require_commander();
var program = new Command();
program.option("-v, --video <videoname>", "video name to process", "video.mp4").option("-f, --file <filename>", "output srt file name", "output").option("-s, --sound <dbvalue>", "db value for silence", "-30dB").option("-d, --duration", "silence duration for detection", "0.2").option("--debug", "debug mode").parse(process.argv);
var options = program.opts();
function get_srt_format_time(origintime = "") {
  let time = Number(origintime.split(".")[0]);
  const hour = Math.floor(time / 3600);
  const minute = Math.floor((time - hour * 3600) / 60);
  const second = time - hour * 3600 - minute * 60;
  let millisecond = origintime.split(".")[1];
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:${String(second).padStart(2, "0")},${millisecond}`;
}
function generate_srt(silence_starts, silence_ends, filename) {
  "generate srt file from silence_starts and silence_ends";
  let cnt = 0;
  let output = "";
  const len = silence_starts.length - 1;
  cnt++;
  output += `${cnt}
`;
  output += `00:00:00,000 --> ${get_srt_format_time(silence_starts[0])}
`;
  output += "\n";
  output += "\n";
  for (let i = 1; i < len; i++) {
    const start = get_srt_format_time(silence_ends[i - 1]);
    const end = get_srt_format_time(silence_starts[i]);
    cnt++;
    output += `${cnt}
`;
    output += `${start} --> ${end}
`;
    output += "\n";
    output += "\n";
  }
  cnt++;
  output += `${cnt}
`;
  output += `${get_srt_format_time(silence_ends[len - 1])} --> 05:00:00,000
`;
  output += "\n";
  output += "\n";
  fs.writeFileSync(`./${filename}.srt`, output);
}
console.log("HELLO WORLD");
var out1 = exec(`ffmpeg -i '${options.video}' -af silencedetect=noise=-30dB:d=0.2 -f null -`, function(error, stdout, stderr) {
  fs.writeFileSync("tmp.txt", stderr.toString());
  const output1 = execSync("sed -i 's/\\r/\\n/g' tmp.txt");
  const silencestarts = execSync("awk '/silence_start/ {print $5}' tmp.txt").toString();
  const silenceends = execSync("awk '/silence_end/ {print $5}' tmp.txt").toString();
  let silence_starts = silencestarts.split("\n");
  let silence_ends = silenceends.split("\n");
  generate_srt(silence_starts, silence_ends, options.file);
  if (!options.debug) {
    fs.unlinkSync("tmp.txt");
  } else {
    let debug_info = "";
    debug_info += "silence_starts:\n";
    debug_info += silence_starts.toString();
    debug_info += "\n";
    debug_info += "silence_ends:\n";
    debug_info += silence_ends.toString();
    debug_info += "\n";
    fs.writeFileSync("debug.info", debug_info);
  }
});
