// Yi-Chia Chen

class spawnerObject {
    constructor(el, playground, margin) {
        this.el = el;
        this.playground = playground;
        this.count = 0;
        this._active = false;
        this.margin = margin;
    }

    set active(value) {
        this._active = value;
        if (this._active) {
            this.show();
        } else {
            this.hide();
        }
    }

    get active() {
        return this._active;
    }

    show() {
        this._active = true;
        this.el.show();
        this.count += 1;
        this.start_time = Date.now();
    }

    hide() {
        this._active = false;
        this.el.hide();
        this.rt = Date.now() - this.start_time;
    }

    get pos() {
        return [this.x, this.y];
    }

    get w() {
        return parseInt(this.el.css('width'), 10);
    }

    get h() {
        return parseInt(this.el.css('height'), 10);
    }

    get playground_x_offset() {
        return this.playground.offset().left;
    }

    get playground_y_offset() {
        return this.playground.offset().top;
    }

    get playground_w() {
        return parseInt(this.playground.css('width'), 10);
    }

    get playground_h() {
        return parseInt(this.playground.css('height'), 10);
    }

    get playground_edges() {
        var top = this.margin;
        var bottom = this.playground_h - this.h - this.margin;
        var left = this.margin;
        var right = this.playground_w - this.w - this.margin;
        return [top, right, bottom, left];
    }

    update_pos() {
        var edges = this.playground_edges;
        this.x = Math.min(Math.max(this.x, edges[3]), edges[1]);
        this.y = Math.min(Math.max(this.y, edges[0]), edges[2]);
        this.el.css({ top: this.y+'px', left: this.x+'px'});
    }

    generate_random_position() {
        var edges = this.playground_edges;
        var x_range = edges[1] - edges[3];
        var y_range = edges[2] -edges[0];
        var x = Math.random() * x_range + edges[3];
        var y = Math.random() * y_range + edges[0];
        return [x, y];
    }

    generate_target(pos=false) {
        if (pos == false) {
            pos = this.generate_random_position();
        }
        this.x = pos[0];
        this.y = pos[1];
        this.update_pos();
    }
}