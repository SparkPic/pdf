const puppeteer = require('puppeteer');
const fs = require('fs');

async function createBrowser() {
    return puppeteer.launch({
        ignoreHTTPSErrors: true,
        headless: true,
        args: ['--disable-gpu', '--no-sandbox', '--disable-setuid-sandbox']
    });
}
async function render(inputPath, outputPath, opts = {}) {
    const browser = await createBrowser();
    const page = await browser.newPage();
    page.setJavaScriptEnabled(false);

    if (opts.viewport) {
        await page.setViewport(opts.viewport);
    }

    if (opts.emulateScreenMedia) {
        await page.emulateMedia('screen');
    }

    try {
        const pdfOpts = opts.pdf || {};
        pdfOpts.path = outputPath;

        await page.setContent(fs.readFileSync(inputPath, 'utf8'));
        await page.pdf(pdfOpts);
    } finally {
        await browser.close();
    }
}

function resolveOptions(arguments) {
    let argName = null;
    const options = {pdf: {format: 'A4', margin: {left: '10mm', right: '10mm', top: '10mm', bottom: '10mm'}}};

    arguments.forEach(function (item) {
        if (item.startsWith('--')) {
            argName = item.substring(2);
            return;
        }

        item = item.trim();

        if (!argName || !item) {
            return;
        }

        switch (argName) {
            case 'page-size':
                options.pdf.format = item;
                break;
            case 'orientation':
                options.pdf.landscape = item.toLowerCase() === 'landscape';
                break;
            case 'margin-left':
                options.pdf.margin.left = item;
                break;
            case 'margin-top':
                options.pdf.margin.top = item;
                break;
            case 'margin-bottom':
                options.pdf.margin.bottom = item;
                break;
            case 'margin-right':
                options.pdf.margin.right = item;
                break;
            case 'page-height':
                options.pdf.height = item;
                break;
            case 'page-width':
                options.pdf.width = item;
                break;
        }
    });

    return options;
}

const argv = process.argv.slice(2);

render(argv.at(0), argv.at(1), resolveOptions(argv));