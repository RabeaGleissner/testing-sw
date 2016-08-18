if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
}

const selector = document.querySelector('#show')
if (selector !== null) {
    selector.addEventListener('click', () => {
        const iconUrl = document.querySelector('select').selectedOptions[0].value;
        let imgElement = document.createElement('img');
        imgElement.src = iconUrl;
        document.querySelector('#container').appendChild(imgElement);
    });
}
