/**
 * 类文档：
 * 
 * SubComponent
 * |_owner                           - 指向组件的指针，在上一个层级(Component)进行绑定
 * |_defaultValue                    - 默认值，会填充到DOM元素中
 * |_value                           - 键值对对象的值，需要绑定DOM元素事件来实现动态修改
 * |_dom                             - 键值对绑定的DOM元素
 * |_constructor(owner,defaultValue) - 构造函数，传入component的指针
 * |_getValue()                      - 返回value属性的值
 * |_setValue(key,newValue)          - 设置value属性，同时更新DOM元素
 * |_initHtml()                      - 由子类重写，返回对应的DOM元素
 * |_updateHtml()                    - 由子类重写，根据value的值更新DOM元素
 * |_updateGraph()                   - 根据owner寻址，通知graph进行更新
 * 
 * 继承关系；
 * 
 * SubComponent
 *     |_SC_Divider     - 分割线
 *     |_SC_NumberInput - 数字输入框
 *     |_SC_ColorInput  - 颜色选择框
 *     |_SC_TextInput   - 文字输入框
 *     |_SC_UrlInput    - URL输入框
 *     |_SC_Select      - 单选下拉列表
 *     |_SC_Vector2     - 二维坐标
 * 
 * by vezzzing 2023.8.3
 * z z z studio
 */

import { Node, Edge } from "./element";

class SubComponent {
    /**
     * 构造函数
     * @param {any} defaultValue 默认值
     * @param {boolean} readOnly 是否是只读的
     */
    constructor(defaultValue = null, readOnly = false) {
        this.owner = null;
        this.defaultValue = defaultValue;
        this.readOnly = readOnly;
        this.value = defaultValue;
        this.dom = null;
    }

    /**
     * 转变到HTML在页面显示
     * 返回htmlDom
     */
    initHtml() /*override*/ { }

    /**
     * 根据value更新HTML
     */
    updateHtml()/*override*/ { }

    /**
     * 跟新graph
     */
    updateGraph() {
        if (this.owner.owner instanceof Node) {
            // 节点
            this.owner.owner.owner.modifyNode(this.owner.owner);
        } else if (this.owner.owner instanceof Edge) {
            // 组件
            this.owner.owner.owner.modifyEdge(this.owner.owner);
        } else {
            console.error(`不是Node也不是Edge的组件`);
        }
    }

    /**
     * 获取属性值
     * @returns any
     */
    getValue() {
        return this.value;
    }

    /**
     * 设置属性值
     * 同时会更新页面
     * @param {any} value 值
     */
    setValue(value) {
        this.value = value;
        this.updateHtml();
    }
}

/**
 * 分割线
 */
export class SC_Divider extends SubComponent {
    constructor() {
        super();
    }
    initHtml() {
        this.dom = document.createElement("div");
        this.dom.classList = "divider";
        return this.dom;
    }
}

/**
 * 数字输入框
 */
export class SC_NumberInput extends SubComponent {
    constructor(defaultValue, readOnly = false, minValue = 0, maxValue = 100, step = 1) {
        super(defaultValue, readOnly);
        this.minValue = minValue;
        this.maxValue = maxValue;
        this.step = step
    }
    initHtml() {
        this.dom = document.createElement("input");
        this.dom.type = "number";
        if (this.readOnly) {
            this.dom.readOnly = "true";
        }
        this.dom.value = this.value;
        this.dom.min = this.minValue;
        this.dom.max = this.maxValue;
        this.dom.step = this.step;
        this.dom.addEventListener("input", () => {
            this.setValue(this.dom.value);
            this.updateGraph();
        });
        return this.dom;
    }
    updateHtml() {
        if (this.dom) {
            this.dom.value = this.value;
        }
    }
}

/**
 * 颜色选择框
 */
export class SC_ColorInput extends SubComponent {
    constructor(defaultValue = "#f6b73c", readOnly = false) {
        super(defaultValue, readOnly);
    }
    initHtml() {
        this.dom = document.createElement("input");
        this.dom.type = "color";
        if (this.readOnly) {
            this.dom.readOnly = "true";
        }
        this.dom.value = this.value;
        this.dom.addEventListener("input", () => {
            this.setValue(this.dom.value);
            this.updateGraph();
        });
        return this.dom;
    }
    updateHtml() {
        if (this.dom) {
            this.dom.value = this.value;
        }
    }
}

/**
 * 文字输入框
 */
export class SC_TextInput extends SubComponent {
    constructor(defaultValue = "text", readOnly = false) {
        super(defaultValue, readOnly);
    }
    initHtml() {
        this.dom = document.createElement("input");
        this.dom.type = "text";
        if (this.readOnly) {
            this.dom.readOnly = "true";
        }
        this.dom.value = this.value;
        this.dom.addEventListener("input", () => {
            this.setValue(this.dom.value);
            this.updateGraph();
        });
        return this.dom;
    }
    updateHtml() {
        if (this.dom) {
            this.dom.value = this.value;
        }
    }
}

/**
 * URL输入框
 */
export class SC_UrlInput extends SubComponent {
    constructor(defaultValue = "text", readOnly = false) {
        super(defaultValue, readOnly);
    }
    initHtml() {
        this.dom = document.createElement("input");
        this.dom.type = "url";
        if (this.readOnly) {
            this.dom.readOnly = "true";
        }
        this.dom.value = this.value;
        this.dom.addEventListener("input", () => {
            this.setValue(this.dom.value);
            this.updateGraph();
        });
        return this.dom;
    }
    updateHtml() {
        if (this.dom) {
            this.dom.value = this.value;
        }
    }
}

/**
 * 下拉列表
 */
export class SC_Select extends SubComponent {
    constructor(defaultValue, readOnly = false, selectList = {}) {
        super(defaultValue, readOnly);
        this.selectList = selectList;
    }
    initHtml() {
        this.dom = document.createElement("select");
        for (let pair of this.selectList) {
            let value = pair.value;
            let text = pair.text;
            let domSelectOption = document.createElement("option");
            domSelectOption.value = value;
            domSelectOption.innerText = text;
            this.dom.appendChild(domSelectOption);
        }
        // 指定默认元素
        for (let i = 0; i < this.dom.options.length; i++) {
            if (this.defaultValue == this.dom.options[i].value) {
                this.dom.options[i].selected = true;
            } else {
                this.dom.options[i].selected = false;
            }
        }
        this.dom.addEventListener("change", () => {
            this.setValue(this.dom.options[this.dom.selectedIndex].value);
            this.updateGraph();
        });
        return this.dom;
    }
    updateHtml() {
        if (this.dom) {
            for (let i = 0; i < this.dom.options.length; i++) {
                if (this.value == this.dom.options[i].value) {
                    this.dom.options[i].selected = true;
                } else {
                    this.dom.options[i].selected = false;
                }
            }
        }
    }
}

/**
 * 表示二维坐标系位置
 */
export class SC_Vector2 extends SubComponent {
    constructor(defaultValue = { x: 1, y: 2 }, readOnly = false) {
        super(defaultValue, readOnly);
    }
    initHtml() {
        this.dom = document.createElement("input");
        this.dom.type = "text";
        if (this.readOnly) {
            this.dom.readOnly = "true";
        }
        this.dom.value = `(${this.value.x},${this.value.y})`;
        this.dom.addEventListener("input", () => {
            let [_, x, y] = this.dom.value.split(/[(,)]/);
            this.value = { x, y };
            this.updateGraph();
        });
        return this.dom;
    }
    updateHtml() {
        if (this.dom) {
            let x = this.value.x;
            let y = this.value.y;
            this.dom.value = `(${x},${y})`;
        }
    }
}

/**
 * 单选框
 */
export class SC_Check extends SubComponent {
    constructor(defaultValue = false, readOnly = false) {
        super(defaultValue, readOnly);
    }
    initHtml() {
        this.dom = document.createElement("input");
        this.dom.type = "checkbox";
        if (this.readOnly) {
            this.dom.readOnly = "true";
        }
        this.dom.checked = this.value;
        this.dom.addEventListener("click", () => {
            this.value = this.dom.checked;
            this.updateGraph();
        })
        return this.dom;
    }
    updateHtml() {
        if (this.dom) {
            this.dom.checked = this.value;
        }
    }
}

/**
 * Tag系统
 */
export class SC_Tag extends SubComponent {
    constructor(defaultValue = ["测试"]) {
        super(defaultValue);
    }
    initHtml() {

    }
}