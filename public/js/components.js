async function loadComponent(elementId, filePath) {

    const response = await fetch(filePath);

    const html = await response.text();

    document.getElementById(elementId).innerHTML = html;

}