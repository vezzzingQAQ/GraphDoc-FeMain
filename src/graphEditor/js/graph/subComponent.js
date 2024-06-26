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
import { showTextEditor } from "../event";
import { uploadStaticFile } from "../../../public/js/serverCom";

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
        // 这个key由component传入，用来进行批量修改
        this.key;
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
    updateGraph(cmd = false) {
        // this.owner.owner.owner.pushUndo();
        if (this.owner.owner instanceof Node) {
            // 节点
            this.owner.owner.owner.modifyNodeExterior(this.owner.owner, cmd);
            this.owner.owner.owner.modifyNodePhysics();
        } else if (this.owner.owner instanceof Edge) {
            // 关系
            this.owner.owner.owner.modifyEdgeExterior(this.owner.owner, cmd);
            this.owner.owner.owner.modifyEdgePhysics();
        } else {
            console.error(`不是Node也不是Edge的组件`);
        }
        // 解决节点有时候选不中的bug
        // isControlDown归位
        this.owner.owner.owner.isControlDown = false;
    }

    /**
     * 更新所有选中的同类型的值
     */
    updateSelectedValue(value, cmd = false, pushUndo = true) {
        if (pushUndo)
            this.owner.owner.owner.pushUndo();
        let selectedElementList = this.owner.owner.owner.selectedElementList
        if (selectedElementList.length > 1) {
            for (let ele of selectedElementList) {
                ele.autoSetValue(this.owner.key, this.key, value);
                if (ele.type == "node") {
                    this.owner.owner.owner.modifyNodeExterior(ele, cmd);
                } else if (ele.type == "edge") {
                    this.owner.owner.owner.modifyEdgeExterior(ele, cmd);
                } else {
                    console.error(`不是Node也不是Edge的组件`);
                }
            }
            this.owner.owner.owner.renderProperties.simulation.stop();
            this.owner.owner.owner.modifyNodePhysics();
            this.owner.owner.owner.modifyEdgePhysics();
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
        this.dom.type = "text";
        if (this.readOnly) {
            this.dom.readOnly = "true";
        }
        this.dom.value = this.value;
        this.dom.addEventListener("input", () => {
            if (this.dom.value < this.minValue) {
                this.dom.value = this.minValue;
            } else if (this.dom.value > this.maxValue) {
                this.dom.value = this.maxValue;
            }
            this.setValue(this.dom.value);
            this.updateSelectedValue(this.value, true);
            this.updateGraph(true);
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
            this.updateSelectedValue(this.value, true, false);
            this.updateGraph(true);
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
            this.updateSelectedValue(this.value, true);
            this.updateGraph(true);
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
            this.updateSelectedValue(this.value, true);
            this.updateGraph(true);
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
        this.dom.value = this.value;
        this.dom.addEventListener("change", () => {
            this.setValue(this.dom.options[this.dom.selectedIndex].value);
            this.updateSelectedValue(this.value, true);
            this.updateGraph(true);
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
            this.updateSelectedValue(this.value);
            this.updateGraph();
        });
        this.dom.addEventListener("blur", () => {
            this.updateSelectedValue(this.value, true);
            this.updateGraph(true);
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
            this.updateSelectedValue(this.value, true);
            this.updateGraph(true);
        });
        return this.dom;
    }
    updateHtml() {
        if (this.dom) {
            this.dom.checked = this.value;
        }
    }
}

/**
 * Textarea框
 */
export class SC_Textarea extends SubComponent {
    constructor(defaultValue = false, readOnly = false, focusAble = true) {
        super(defaultValue, readOnly);
        this.focusAble = focusAble;
    }
    initHtml() {
        this.dom = document.createElement("textarea");
        if (this.focusAble)
            this.dom.id = "text_cop_textarea";
        this.dom.classList = "styleScrollBar";
        this.dom.spellcheck = false;
        if (this.readOnly) {
            this.dom.readOnly = "true";
        }
        // 支持tab缩进
        this.dom.onkeydown = function (e) {
            if (e.keyCode == 9) {
                let position = this.selectionStart + 2;
                this.value = this.value.substr(0, this.selectionStart) + '  ' + this.value.substr(this.selectionStart);
                this.selectionStart = position;
                this.selectionEnd = position;
                this.focus();
                e.preventDefault();
            }
        };
        // 双击进入细节编辑模式
        let _ = this;
        this.dom.ondblclick = function (e) {
            showTextEditor(this, newValue => {
                _.dom.value = newValue;
                _.value = _.dom.value;
                _.updateSelectedValue(_.value);
                _.updateGraph();
            });
        }
        this.dom.value = this.value;
        this.dom.addEventListener("input", () => {
            this.value = this.dom.value;
            this.updateSelectedValue(this.value, true);
            this.updateGraph(true);
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
 * 文件上传
 */
export class SC_FileInput extends SubComponent {
    constructor(defaultValue = "/", readOnly = false, accept, catg, urlUpload, urlLoad) {
        super(defaultValue, readOnly);
        this.accept = accept;
        this.catg = catg;
        this.urlUpload = urlUpload;
        this.urlLoad = urlLoad;
    }
    initHtml() {
        this.dom = document.createElement("input");
        this.dom.type = "file";
        this.dom.accept = this.accept;
        if (this.readOnly) {
            this.dom.readOnly = "true";
        }
        // 读取本地图片文件上传服务器，返回URL生成IMG标签
        this.dom.addEventListener("input", async () => {
            let data = await uploadStaticFile(this.urlUpload, this.catg, this.dom.files[0]);
            if (data.state == 1) {
                this.setValue(data.msg.filename);
                this.updateGraph();
            } else {
                console.log("文件上传失败");
            }
        });
        this.dom.addEventListener("blur", () => {
            this.updateSelectedValue(this.value, true);
            this.updateGraph(true);
        });
        return this.dom;
    }
    updateHtml() { }
}

/**
 * Tag系统
 */
export class SC_Tag extends SubComponent {
    constructor(defaultValue = ["测试"], readOnly = false) {
        super(defaultValue);
        this.addBtnDom;
    }

    // 生成指定valueTag的DOM元素
    initBtnDom(value) {
        let tagContainer = document.createElement("div");
        tagContainer.classList = "tagContainer";
        let tagDeleteBtn = document.createElement("p");
        tagDeleteBtn.classList = "tagDeleteBtn";
        tagDeleteBtn.innerHTML = "×";
        let tagDom = document.createElement("input");
        tagDom.classList = "tagDom tagBtn";
        tagDom.type = "text";
        tagDom.value = value;
        // 宽度自适应
        let spanTempDom = document.createElement("span");
        spanTempDom.innerHTML = tagDom.value;
        spanTempDom.style.display = "hidden";
        document.querySelector("body").appendChild(spanTempDom)
        if (spanTempDom.offsetWidth > 10) {
            tagContainer.style.width = spanTempDom.offsetWidth + 35 + "px";
        }
        spanTempDom.remove();
        tagDom.addEventListener("input", () => {
            let tagDoms = document.querySelectorAll(".tagDom");
            this.value = [];
            for (let i = 0; i < tagDoms.length; i++) {
                let currentTagDom = tagDoms[i];
                this.value[i] = currentTagDom.value;
            }
            // 宽度自适应
            let spanTempDom = document.createElement("span");
            spanTempDom.innerHTML = tagDom.value;
            spanTempDom.style.display = "hidden";
            document.querySelector("body").appendChild(spanTempDom)
            if (spanTempDom.offsetWidth > 10) {
                tagContainer.style.width = spanTempDom.offsetWidth + 35 + "px";
            }
            spanTempDom.remove();
        });
        tagDom.addEventListener("blur", () => {
            this.updateSelectedValue(this.value, true);
            this.updateGraph(true);
        })
        tagDeleteBtn.addEventListener("click", () => {
            tagDom.remove();
            tagDeleteBtn.remove();
            tagContainer.remove();
            let tagDoms = document.querySelectorAll(".tagDom");
            this.value = [];
            for (let i = 0; i < tagDoms.length; i++) {
                let currentTagDom = tagDoms[i];
                this.value[i] = currentTagDom.value;
            }
        });
        tagDeleteBtn.addEventListener("blur", () => {
            this.updateSelectedValue(this.value, true);
            this.updateGraph(true);
        })

        tagContainer.appendChild(tagDom);
        tagContainer.appendChild(tagDeleteBtn);

        return tagContainer;
    }

    // 将指定的TAG DOM元素放入框架
    pushTagDom(dom) {
        if (dom) {
            this.dom.appendChild(dom);

            // 把增加按钮放到最后
            if (this.addBtnDom)
                this.dom.appendChild(this.addBtnDom);

            // 绑定value
            let tagDoms = document.querySelectorAll(".tagDom");
            for (let i = 0; i < tagDoms.length; i++) {
                let currentTagDom = tagDoms[i];
                this.value[i] = currentTagDom.value;
            }
        }
    }

    // 加入TAG
    addTag(value) {
        if (!this.value.includes(value)) {
            this.value.push(value);
            this.updateSelectedValue(this.value, true);
            this.updateGraph(true);
        }
    }

    initHtml() {
        this.dom = document.createElement("div");
        this.dom.id = "tag_node";
        if (this.readOnly) {
            this.dom.readOnly = "true";
        }

        // 增添插入按钮
        this.addBtnDom = document.createElement("div");
        this.addBtnDom.classList = "addBtnDom tagBtn";
        this.addBtnDom.innerHTML = "+";
        this.addBtnDom.addEventListener("click", () => {
            let tagDom = this.initBtnDom("");
            this.dom.insertBefore(tagDom, this.addBtnDom);
            tagDom.querySelector("input").focus();
        })
        this.dom.appendChild(this.addBtnDom);

        // 插入所有TAG的DOM元素
        for (let i = 0; i < this.value.length; i++) {
            let tag = this.value[i];
            this.pushTagDom(this.initBtnDom(tag));
        }

        return this.dom;
    }
    updateHtml() {
        // if (this.dom) {

        // }
    }
}