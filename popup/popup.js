document.getElementById("fill-btn").addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab.id || tab.url.startsWith("chrome://") || tab.url.startsWith("edge://")) {
        return;
    }

    const ___fillOp = parseInt(document.querySelector('input[name="fill-op"]:checked').value, 10);
    const ___randomOptions = Array.from(document.querySelectorAll('input[name="random-cb"]:checked')).map(cb => parseInt(cb.value, 10));
    const ___autoSubmit = document.getElementById('auto-submit').checked;

    await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: ___fillForms,
        args: [___fillOp, ___randomOptions, ___autoSubmit] 
    });
});

document.getElementById("complete-all-btn").addEventListener("click", async () => {
    const ___delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab.id || tab.url.startsWith("chrome://") || tab.url.startsWith("edge://")) {
        return;
    }

    const ___surveysOp = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: ___getSurveysOptions,
    });

    const ___fillOp = parseInt(document.querySelector('input[name="fill-op"]:checked').value, 10);
    const ___randomOptions = Array.from(document.querySelectorAll('input[name="random-cb"]:checked')).map(cb => parseInt(cb.value, 10));

    for (let i = 0; i < ___surveysOp[0].result.data.length; i++) {
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: ___selectSurvay,
            args: [___surveysOp[0].result.data[i]]
        });

        await ___delay(300)

        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: ___fillForms,
            args: [___fillOp, ___randomOptions, true] 
        });

        await ___delay(1000)
    }
});

function ___getSurveysOptions() {
    const ___doc = document.querySelector('frame[name="center"]').contentDocument;
    const ___surveysOp =  ___doc.querySelectorAll('select[name="HTMLEncuesta"] > option');

    return {
        data: Array.from(___surveysOp).map(op => op.value)
    };
}

function ___selectSurvay(value) {
    const ___doc = document.querySelector('frame[name="center"]').contentDocument;
    ___doc.querySelector('select[name="HTMLEncuesta"]').value = value;
    ___doc.querySelector('input[name="btnMostrar"]').click();
}

function ___fillForms(op = -1, randomOptions = [0, 1, 2, 3, 4], autoSubmit = false) {
    const ___doc = document.querySelector('frame[name="center"]').contentDocument;

    if (!___doc.location.href.includes('control.p?')) {
        return;
    };

    const ___inputs = ___doc.querySelectorAll('input[type="radio"]');
    if (op == -1) {
        if (randomOptions.length === 0) {
            alert("No seleccionaste ninguna opción aleatoria.")
            return;
        };
        
        for (let i = 0; i < ___inputs.length; i+=5) {
            const ___randomIndex = randomOptions[Math.floor(Math.random() * randomOptions.length)];
            ___inputs[i + ___randomIndex].checked = true;
        }
    } else {
        for (let i = 0; i < ___inputs.length; i+=5) {
            ___inputs[i + op].checked = true;
        }
    }

    if (autoSubmit) {
        ___doc.querySelector('input[name="btnGrabar"]').click();
    }
}