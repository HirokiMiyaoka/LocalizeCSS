"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const VERSION = '0.1.0';
class LocalizeCSS {
    constructor(config = {}) {
        this.config = config;
        this.src = '';
        this.files = [];
        this.selectors = [];
    }
    loadCSV(filename) {
        return new Promise((resolve, reject) => {
            const data = [];
            let count = 0;
            const ignore = this.config.ignore || 0;
            const read = readline.createInterface(fs.createReadStream(path.join(this.src, filename + '.csv'), 'utf8'));
            read.on('line', (line) => {
                if (count++ < ignore || !line) {
                    return;
                }
                const [s, w, ...c] = line.split(',');
                if (!s) {
                    return;
                }
                const csv = { selector: s, word: w, css: c.join(',') };
                if (!s.match(/\:(before|after)$/)) {
                    csv.selector += ':before';
                }
                data.push(csv);
            });
            read.on('close', () => { resolve(data); });
            read.on('SIGCONT', () => { reject(); });
            read.on('SIGINT', () => { reject(); });
            read.on('SIGTSTP', () => { reject(); });
        }).catch((error) => { return []; });
    }
    convertCSVtoCSS(filename) {
        return this.loadCSV(filename).then((csv) => {
            const css = {};
            csv.forEach((c) => {
                css[c.selector] = 'content:"' + c.word + '"';
                if (c.css) {
                    css[c.selector] += ';' + css;
                }
            });
            let count = 0;
            if (this.config.default) {
                this.selectors.forEach((s) => {
                    if (css[s]) {
                        return;
                    }
                    if (count++ <= 0) {
                        console.error('Items missing:', filename);
                    }
                    console.error(' ', s);
                });
            }
            return css;
        });
    }
    output(file, base, css) {
        return new Promise((resolve, reject) => {
            fs.writeFile(file, Object.keys(css).map((s) => {
                return base + s + '{' + css[s] + '}';
            }).join(''), (error) => {
                if (error) {
                    console.error(error);
                }
                resolve();
            });
        });
    }
    load(dir) {
        return new Promise((resolve, reject) => {
            this.src = dir;
            fs.readdir(dir, (error, files) => {
                if (error) {
                    return reject(error);
                }
                this.files = [];
                files.forEach((file) => {
                    const filename = file.replace(/\.csv$/, '');
                    if (file === filename) {
                        return;
                    }
                    const stat = fs.statSync(path.join(dir, file));
                    if (!stat.isFile()) {
                        return;
                    }
                    this.files.push(filename);
                });
                resolve(this.files);
            });
        }).then((files) => {
            const def = this.config.default || '';
            if (!def) {
                return files;
            }
            return this.loadCSV(def).then((csv) => {
                this.selectors = csv.map((c) => { return c.selector; });
                return files;
            });
        });
    }
    generate(dir) {
        const p = this.files.map((f) => {
            return this.convertCSVtoCSS(f).then((css) => { return this.output(path.join(dir, f + '.css'), f === this.config.default ? '' : ('.' + f + ' '), css); });
        });
        return Promise.all(p);
    }
}
function PrintHelp() {
    console.log(`Version ${VERSION}
Syntax:   localizecss [options] src dest

Examples: node dest/localizecss.js -- localize/ docs/localize/
          node dest/localizecss.js -- -i 1 localize/ docs/localize/

Options:
 -h, --help     Print this help.
 -i, --ignore   Ignore first line number. Default 0.
                LocaleCSS ignore first N lines in CSV.
 -d, --default  Default language. Default ''.
                Enable check CSV.

TODO:
-c, --charset Set load encoding.
-e, --extension Set load file extension. default csv.
--dryrun
`);
}
function Main() {
    const data = { src: './localize', dest: './docs/localize', config: {} };
    let count = 0;
    for (let i = 2; i < process.argv.length; ++i) {
        switch (process.argv[i]) {
            case '-h':
            case '--help':
                PrintHelp();
                process.exit(0);
                break;
            case '-i':
            case '--ignore':
                data.config.ignore = parseInt(process.argv[++i]);
                break;
            case '-d':
            case '--default':
                data.config.default = process.argv[++i] || '';
                break;
            default:
                if (count < 2) {
                    data[count ? 'dest' : 'src'] = process.argv[i];
                    ++count;
                }
        }
    }
    if (!data.config.ignore || data.config.ignore === NaN || data.config.ignore <= 0) {
        data.config.ignore = 0;
    }
    return Promise.resolve(data);
}
Main().then((config) => {
    console.log(config);
    const lcss = new LocalizeCSS(config.config);
    return lcss.load(config.src).then((files) => {
        console.log(files);
        lcss.generate(config.dest);
    });
}).catch((error) => {
    console.error(error);
});
