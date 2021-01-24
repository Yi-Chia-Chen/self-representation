// Yi-Chia Chen

class gameObject {
    constructor(guide, rescue, spawner, cool_off_duration, target_n, recording_pursuit_target_num) {
        this.guide = guide;
        this.rescue = rescue;
        this.spawner = spawner;
        this.active = false;
        this.first_cursor_appearance = true;
        this.cool_off_duration = cool_off_duration;
        this.target_n = target_n;
        this.recording_pursuit_target_num = recording_pursuit_target_num;
        this.record_trajectory = false;
    }

    update(targetList) {
        this.target_positions = targetList;
        this.guideTrajectory = [];
        this.rescueTrajectory = [];
        this.targetRts = [];
        this.spawner.count = 0;
        this.guide.playground.removeClass('hide-world');
    }

    start(display_only, trial_type, trial_trajectory, callback) {
        this.allTrajectory = '[';
        var that = this;
        $('body').css('cursor', 'none');
        if (trial_type == 'performing') {
            function FOLLOW_MOUSE(e) {
                that.real_cursor_x = e.pageX;
                that.real_cursor_y = e.pageY;
                if (that.first_cursor_appearance) {
                    that.first_cursor_appearance = false;
                    that.guide.update();
                    that.rescue.update();
                    var start_time = Date.now();
                    requestAnimationFrame(function(time){
                        that.step(display_only, start_time, callback);
                    });
                }
            }
            that.guide.playground.removeClass('hide-world');
            that.guide.x = that.guide.playground_w/2 - that.guide.w/2;
            that.guide.y = that.guide.playground_h/2 - that.guide.h/2;
            that.guide.ori = 0;
            that.guide.update();
            that.rescue.x = that.rescue.playground_w/2 - that.rescue.w/2;
            that.rescue.y = that.rescue.playground_h/2 - that.rescue.h/2;
            that.rescue.ori = 0;
            that.rescue.update();
            that.active = true;
            that.guide.show();
            that.rescue.show();
            that.spawner.generate_target(that.target_positions[0]);
            that.spawner.show();
            that.check_to_record_trajectory();
            $(document).mousemove(FOLLOW_MOUSE);
        } else {
            this.play(display_only, trial_trajectory, callback);
        }
    }

    check_to_record_trajectory() {
        if (this.spawner.count == this.recording_pursuit_target_num) {
            this.record_trajectory = true;
        }
    }

    step(display_only, start_time, callback) {
        var current_time = Date.now();
        var time_elapsed = (current_time - start_time) / 1000;
        this.framePosOri = [time_elapsed.toString(), 0, 0, 0];
        this.guide_step(time_elapsed);
        this.rescue_step(time_elapsed);
        this.spawner_step(current_time);

        this.allTrajectory = this.allTrajectory+ '['+(this.framePosOri.toString())+'],';
        start_time = Date.now();
        if (this.active) {
            var that = this;
            requestAnimationFrame(function(time){
                that.step(display_only, start_time, callback);
            });
        }
        else{
            this.end(display_only, callback);
        }
    }

    guide_step(time_elapsed) {
        var destination = this.get_destination(this.guide);
        this.guide.step(time_elapsed, destination);
        this.framePosOri[1] = '['+([this.guide.x, this.guide.y, this.guide.ori].toString())+']';
        if (this.record_trajectory) {
            this.guideTrajectory.push([time_elapsed, this.guide.x, this.guide.y, this.guide.ori]);
        }
    }

    rescue_step(time_elapsed) {
        var rescue_destination = this.transfer_coordinates(this.guide, this.rescue);
        this.rescue.step(time_elapsed, rescue_destination);
        this.framePosOri[2] = '['+([this.rescue.x, this.rescue.y, this.rescue.ori].toString())+']';
        if (this.record_trajectory) {
            this.rescueTrajectory.push([time_elapsed, this.rescue.x, this.rescue.y, this.rescue.ori]);
        }
    }

    spawner_step (current_time) {
        if (this.spawner.active) {
            var interaction_dist = this.rescue.w/2 + this.spawner.w/2;
            if (DISTANCE_BETWEEN_POINTS(this.spawner.pos, this.rescue.pos) < interaction_dist) {
                this.despawn_target();
            }
        }
        else {
            var time_elapsed = (current_time - this.spawner.cool_off_start_time) / 1000;
            if (time_elapsed > this.cool_off_duration) {
                this.respawn_target();
            }
        }
        this.framePosOri[3] = '['+([this.spawner.pos[0], this.spawner.pos[1], this.spawner.active].toString())+']';
    }

    despawn_target() {
        this.spawner.hide();
        this.record_trajectory = false;
        this.targetRts.push(this.spawner.rt);
        if (this.spawner.count < this.target_n) {
            if (this.spawner.count == this.start_record_target_num) {
                this.record_trajectory = true;
            } else if (this.spawner.count == this.end_record_target_num) {
                this.record_trajectory = false;
            }
            this.spawner.generate_target(this.target_positions[this.spawner.count]);
            this.spawner.cool_off_start_time = Date.now();
        } else {
            this.active = false;
        }
    }

    respawn_target() {
        this.spawner.show();
        this.check_to_record_trajectory();
    }

    get_destination(agent) {
        var destination_x = this.real_cursor_x - agent.playground_x_offset - agent.w/2;
        var destination_y = this.real_cursor_y - agent.playground_y_offset - agent.h/2;
        return [destination_x, destination_y];
    }

    transfer_coordinates(controller, device) {
        var device_destination_x = controller.x + controller.playground_x_offset + controller.w/2 - device.playground_x_offset - device.w/2;
        var device_destination_y = controller.y + controller.playground_y_offset + controller.h/2 - device.playground_y_offset - device.h/2;
        return [device_destination_x, device_destination_y];
    }

    play(display_only, trajectory, callback) {
        this.allTrajectory = 'X';
        const STEP_N = trajectory.length; // [[time1, [guideX,guideY,guideOri], [rescueX,rescueY,rescueOri], [targetX,targetY,targetOn]], [time2, ...], ...]

        var time_elapsed = trajectory[0][0]
        this.guide.x = trajectory[0][1][0];
        this.guide.y = trajectory[0][1][1];
        this.guide.ori = trajectory[0][1][2];
        this.guide.update();
        this.rescue.x = trajectory[0][2][0];
        this.rescue.y = trajectory[0][2][1];
        this.rescue.ori = trajectory[0][2][2];
        this.rescue.update();
        this.spawner.x = trajectory[0][3][0];
        this.spawner.y = trajectory[0][3][1];
        this.spawner.update_pos();
        this.spawner.active = trajectory[0][3][2];
        this.guide.show();
        this.rescue.show();

        var that = this;
        function PLAY_STEP() {
            that.guide.update();
            that.rescue.update();
            that.spawner.update_pos();
            const SPAWNER_STATUS = trajectory[step_num][3][2];
            if (that.spawner.active !== SPAWNER_STATUS) {
                that.spawner.active = SPAWNER_STATUS;
                if (!SPAWNER_STATUS) {
                    that.targetRts.push(that.spawner.rt);
                }
            }
            if ((that.spawner.count == that.recording_pursuit_target_num) && (that.spawner.active)) {
                that.guideTrajectory.push([time_elapsed, that.guide.x, that.guide.y, that.guide.ori]);
                that.rescueTrajectory.push([time_elapsed, that.rescue.x, that.rescue.y, that.rescue.ori]);
            }
            step_num += 1;
            if (step_num<STEP_N) {
                time_elapsed = trajectory[step_num][0]
                that.guide.x = trajectory[step_num][1][0];
                that.guide.y = trajectory[step_num][1][1];
                that.guide.ori = trajectory[step_num][1][2];
                that.rescue.x = trajectory[step_num][2][0];
                that.rescue.y = trajectory[step_num][2][1];
                that.rescue.ori = trajectory[step_num][2][2];
                that.spawner.x = trajectory[step_num][3][0];
                that.spawner.y = trajectory[step_num][3][1];
                REQUEST_TIMEOUT(PLAY_STEP, time_elapsed);
            } else {
                that.end(display_only, callback);
            }
        }

        var step_num = 1;
        time_elapsed = trajectory[step_num][0]
        this.guide.x = trajectory[step_num][1][0];
        this.guide.y = trajectory[step_num][1][1];
        this.guide.ori = trajectory[step_num][1][2];
        this.rescue.x = trajectory[step_num][2][0];
        this.rescue.y = trajectory[step_num][2][1];
        this.rescue.ori = trajectory[step_num][2][2];
        this.spawner.x = trajectory[step_num][3][0];
        this.spawner.y = trajectory[step_num][3][1];
        REQUEST_TIMEOUT(PLAY_STEP, time_elapsed);
    }

    end(display_only, callback) {
        this.guide.hide();
        this.rescue.hide();
        this.spawner.hide();
        $(document).off('mousemove');
        this.first_cursor_appearance = true;
        this.guide.playground.addClass('hide-world');
        $('body').css('cursor', 'auto');
        if (display_only){
            callback();
        } else {
            START_REPLAY();
        }
    }

    generate_test_trajectory(agent_name, test_same) {
        var same_trajectory = eval('this.'+agent_name+'Trajectory');
        if (test_same) {
            return Array.from(same_trajectory);
        } else {
            return this.flip_trajectory(same_trajectory);
        }
    }

    flip_trajectory(trajectory) { // [[time_elapsed, device.x, device.y, device.ori], ...]
        const START_POINT = [trajectory[0][1], trajectory[0][2]];
        const END_POINT = [trajectory[trajectory.length-1][1], trajectory[trajectory.length-1][2]];
        const START_END_LINE_SLOPE = SLOPE_FROM_POINTS(START_POINT, END_POINT);
        const START_END_LINE_Y_INTERCEPT = Y_INTERCEPT_FROM_POINTS(START_POINT, END_POINT);
        const LINE_ORI = LINE_ANGLE_TO_X_AXIS(START_END_LINE_SLOPE);
        var new_trajectory = [];
        for (var i=0; i<trajectory.length; i++) {
            var now_step = trajectory[i];
            var now_duration = now_step[0];
            var now_x = now_step[1];
            var now_y = now_step[2];
            var now_ori = now_step[3];
            var flipped_ori = (180 - now_ori + 2*LINE_ORI) % 360;
            var reflection_point = REFLECTION_POINT_THROUGH_A_LINE([now_x, now_y], START_END_LINE_SLOPE, START_END_LINE_Y_INTERCEPT);
            new_trajectory.push([now_duration, reflection_point[0], reflection_point[1], flipped_ori]);
        }
        return new_trajectory;
    }

    replay(display_only, example, agent_name, trajectory, callback) {
        const STEP_N = trajectory.length;
        var agent = eval('this.'+agent_name);
        agent.x = trajectory[0][1];
        agent.y = trajectory[0][2];
        agent.ori = trajectory[0][3];
        agent.update();
        this.guide.playground.removeClass('hide-world');
        agent.show();

        function REPLAY_STEP() {
            agent.update();
            step_num += 1;
            if (step_num<STEP_N) {
                agent.x = trajectory[step_num][1];
                agent.y = trajectory[step_num][2];
                agent.ori = trajectory[step_num][3];
                REQUEST_TIMEOUT(REPLAY_STEP, trajectory[step_num][0]);
            } else {
                agent.hide();
                if (display_only) {
                    callback();
                } else {
                    START_RESPONSE(example, callback);
                }
            }
        }

        var step_num = 1;
        agent.x = trajectory[step_num][1];
        agent.y = trajectory[step_num][2];
        agent.ori = trajectory[step_num][3];
        REQUEST_TIMEOUT(REPLAY_STEP, trajectory[step_num][0]);
    }
}
