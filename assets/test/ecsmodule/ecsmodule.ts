import { ecs } from "db://oops-framework/libs/ecs/ECS";

/** ecsmodule 模块 */
@ecs.register('ecsmodule')
export class ecsmodule extends ecs.Entity {
    /** ---------- 数据层 ---------- */
    // ecsmoduleModel!: ecsmoduleModelComp;

    /** ---------- 业务层 ---------- */
    // ecsmoduleBll!: ecsmoduleBllComp;

    /** ---------- 视图层 ---------- */
    // ecsmoduleView!: ecsmoduleViewComp;

    /** 初始添加的数据层组件 */
    protected init() {
        // this.addComponents<ecs.Comp>();
    }
}