import { model } from "../model/model.js";

class FilterView extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
        model.addEventListener("participantsChanged", () => this.render());
        model.addEventListener("tagsChanged", () => this.render());
        model.addEventListener("filtersChanged", () => this.render());
        this.render();
    }

    render() {
        const participants = [...model.participants.values()];
        const tags = [...model.tags.values()];
        const activeFilters = model.filterCriteria;

        const participantOptions = participants
            .map((p) => {
                const selected = activeFilters.participantId === p.id ? "selected" : "";
                return `<option value="${p.id}" ${selected}>${this.#escape(p.name)}</option>`;
            })
            .join("");

        const tagOptions = tags
            .map((t) => {
                const selected = activeFilters.tagId === t.id ? "selected" : "";
                return `<option value="${t.id}" ${selected}>${this.#escape(t.name)}</option>`;
            })
            .join("");

        this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="./styles/main.css">

      <section class="sidebar__section">
        <h2 class="sidebar__heading">Filter</h2>

        <div class="form-group">
          <label for="filter-status">Status</label>
          <select id="filter-status" name="filter-status">
            <option value="alle" ${activeFilters.status === "alle" ? "selected" : ""}>Alle</option>
            <option value="geplant" ${activeFilters.status === "geplant" ? "selected" : ""}>Geplant</option>
            <option value="abgeschlossen" ${activeFilters.status === "abgeschlossen" ? "selected" : ""}>Abgeschlossen</option>
          </select>
        </div>

        <div class="form-group">
          <label for="filter-participant">Teilnehmer</label>
          <select id="filter-participant" name="filter-participant">
            <option value="alle" ${activeFilters.participantId === "alle" ? "selected" : ""}>Alle Teilnehmer</option>
            ${participantOptions}
          </select>
        </div>

        <div class="form-group">
          <label for="filter-tag">Tags</label>
          <select id="filter-tag" name="filter-tag">
            <option value="alle" ${activeFilters.tagId === "alle" ? "selected" : ""}>Alle Tags</option>
            ${tagOptions}
          </select>
        </div>
      </section>
    `;

        const statusEl = this.shadowRoot.querySelector("#filter-status");
        const participantEl = this.shadowRoot.querySelector("#filter-participant");
        const tagEl = this.shadowRoot.querySelector("#filter-tag");

        if (statusEl) {
            statusEl.addEventListener("change", () => this.#emitFiltersChanged());
        }
        if (participantEl) {
            participantEl.addEventListener("change", () => this.#emitFiltersChanged());
        }
        if (tagEl) {
            tagEl.addEventListener("change", () => this.#emitFiltersChanged());
        }
    }

    #emitFiltersChanged() {
        const statusEl = this.shadowRoot.querySelector("#filter-status");
        const participantEl = this.shadowRoot.querySelector("#filter-participant");
        const tagEl = this.shadowRoot.querySelector("#filter-tag");

        const status = statusEl ? statusEl.value : "alle";
        const participantId = participantEl ? participantEl.value : "alle";
        const tagId = tagEl ? tagEl.value : "alle";

        this.dispatchEvent(new CustomEvent("filters-changed", {
            detail: { status, participantId, tagId },
            bubbles: true,
            composed: true,
        }));
    }

    #escape(str) {
        return String(str || "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }
}
customElements.define("filter-view", FilterView);