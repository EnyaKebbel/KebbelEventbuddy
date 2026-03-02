import {model} from "../model/model.js";

class EventItem extends HTMLElement {
    #event;
    constructor() {
        super();
        this.attachShadow({mode: "open"});
    }

    set event(event) {
        this.#event = event;
        this.render();
    }

    get event() {
        return this.#event;
    }

    //Einzelne Event Items
    render() {
        if (!this.#event) return;

        const e = this.#event;

        //Format dateTime
        const dt = new Date(e.dateTime);
        const date = dt.toLocaleDateString("de-DE");
        const time = dt.toLocaleTimeString("de-DE", {hour:"2-digit", minute:"2-digit"});
        const tagsHtml = (e.tagIds ?? [])
            .map(id => model.getTagById(id)?.name ?? id)
            .map(name => `<li>${name}</li>`).join("");

        this.shadowRoot.innerHTML = `
        <link rel="stylesheet" href="./styles/main.css">
      <article class="event-card" data-event-id="${e.id}">
        <div class="event-card__media" aria-hidden="true">
          <img src="Images/Event.png" alt="Event Icon">
        </div>

        <div class="event-card__content">
          <h3 class="event-card__title">${e.title}</h3>
          <p class="event-card__meta">${date} · ${time} · ${e.location}</p>
          <p class="event-card__meta">Status: ${e.status}</p>
          <ul class="event-card__tags">
            ${tagsHtml}
          </ul>
        </div>

        <div class="event-card__actions">
          <button type="button" class="btn btn-details">Details</button>
        </div>
      </article>
    `;

        //Details Zeigen -> feuert event zu controller
        this.shadowRoot.querySelector(".btn-details")?.addEventListener("click", () => {
        this.dispatchEvent(
            new CustomEvent("select-event", {
                detail: e.id,
                bubbles: true,
                composed: true
            })
        );
    });
}
}
customElements.define('event-item', EventItem);

class EventList extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: "open"});
    }

    connectedCallback() {
        this.render();
        model.addEventListener("eventsChanged", () => this.render());
        model.addEventListener("filtersChanged", () => this.render());
        model.addEventListener("tagsChanged", () => this.render());
    }

    //Äußerer Container um Event Items
    render() {
        this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="/styles/main.css">
      <div class="event-list"></div>
    `;

        const events = model.getEventsFiltered ? model.getEventsFiltered() : [];

        for (const ev of events) {
            this.addEvent(ev);
        }
    }

    addEvent(event) {
        const list = this.shadowRoot.querySelector(".event-list");
        if (!list) return;

        const item = document.createElement("event-item");
        item.event = event;
        list.appendChild(item);
    }
}
customElements.define('event-list', EventList)