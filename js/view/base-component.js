import { model } from "../model/model.js";

export default class BaseComponent extends HTMLElement {
    connectedCallback() {
        model.addEventListener("viewChanged", () => this.applyView());
        this.applyView();
    }

    applyView() {
        const view = model.currentView;

        const screens = {
            list: document.querySelector("#screen-list"),
            detail: document.querySelector("#screen-detail"),
            form: document.querySelector("#screen-form"),
            tags: document.querySelector("#screen-tags"),
        };

        // erst alles ausblenden
        Object.values(screens).forEach(el => {
            if (el) el.style.display = "none";
        });

        // dann nur den aktiven Screen anzeigen
        if (screens[view]) {
            screens[view].style.display = "block";
        } else {
            // fallback
            if (screens.list) screens.list.style.display = "block";
        }
    }
}

customElements.define("base-component", BaseComponent);