// Yi-Chia Chen

class agentObject {
    constructor(el, pos, ori, speed, playground) {
        this.el = el;
        this.x = pos[0];
        this.y = pos[1];
        this.ori = ori;
        this.speed = speed;
        this.playground = playground;
    }

    show() {
        this.el.show();
    }

    hide() {
        this.el.hide();
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
        var top = 0;
        var bottom = this.playground_h - this.h;
        var left = 0;
        var right = this.playground_w - this.w;
        return [top, right, bottom, left];
    }

    step(time_elapsed, destination, ori=true, pos=true) {
        var x_vector = destination[0] - this.x;
        var y_vector = destination[1] - this.y;
        var now_dist = VECTOR_LENGTH(x_vector, y_vector);
        if (now_dist != 0){
            var now_step_size = this.speed * time_elapsed;
            var now_portion = Math.min(now_step_size / now_dist, 1);
            this.ori = 90 - TO_DEGREES(Math.atan2(-y_vector, x_vector)) ;
            this.x += x_vector * now_portion;
            this.y += y_vector * now_portion;
            this.update(ori, pos);
        }
    }

    update(ori=true, pos=true) {
        if (pos) {
            this.update_pos();
        }
        if (ori) {
            this.update_ori();
        }
    }

    update_pos() {
        var edges = this.playground_edges;
        this.x = Math.min(Math.max(this.x, edges[3]), edges[1]);
        this.y = Math.min(Math.max(this.y, edges[0]), edges[2]);
        this.el.css({ top: this.y+'px', left: this.x+'px'});
    }

    update_ori() {
        this.el.css({ transform: 'rotate('+this.ori+'deg)'});
    }
}