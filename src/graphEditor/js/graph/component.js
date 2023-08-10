/**
 * 类文档：
 * 
 * Component
 * |_owner                           - 指向元素的指针，在上一个层级(Node)进行绑定
 * |_showName                        - 组件的名字
 * |_key                             - 组件的key，用来让元素寻址
 * |_delAble                         - 组件是否可以被删除掉
 * |_componentMap                    - 组件的属性-键值对映射表(string->subComponent*)
 * |_constructor(owner,showName,key) - 构造函数，传入node的指针
 * |_addValue(key,showName,subComp)  - 添加键值对
 * |_getValue(key)                   - 根据key获得键值对的值，后台调用subComponent的getValue来实现
 * |_setValue(key,newValue)          - 根据key设置键值对的值，后台调用subComponent的setValue来实现
 * |_initHtml()                      - 将组件的所有属性罗列到属性面板中
 * |_toJsonObj()                     - 将组件的属性转为JsonObject，去掉一些不要的属性
 * 
 * 继承关系；
 * 
 * Component
 *     |_C_N_Exterior - 节点外观组件 - exterior_node
 *     |_C_N_Physics  - 节点物理组件 - physics_node
 *     |_C_N_Link     - 节点链接组件 - link_node
 *     |_C_N_Text     - 节点文本组件 - text_node
 * 
 * 从JSON生成类：
 * 
 * · json示例：
 * | "exterior":{
 * |     "size":{"x":1,"y":1},
 * |     "shape":"circle",
 * |     "dividerColor":null,
 * |     "bgColor":"#000000",
 * |     "fgColor":"#ffffff",
 * |     "dividerStroke":null,
 * |     "strokeColor":"#ffffff",
 * |     "strokeStyle":"line",
 * |     "strokeWidth":1
 * | }
 * · 步骤
 * · 用ComponentMap查询到对应的Component的class
 * · 直接调用构造函数进行生成
 * | 封装在LoadComponentFromJson(key, valueObj)函数中
 * | key就是从ComponentMap查询到的key
 * | valueObj直接指定值
 * 
 * 生成组件列表DOM元素：
 * · 直接调用InitComponentDom()
 * 
 * by vezzzing 2023.8.3
 * z z z studio
 */

class Component {
    /**
     * 节点组件-父类 
     * @param {string} showName 组件显示在属性面板中的命名
     * @param {string} key 组件的key，用来让节点寻址
     */
    constructor(showName/*override*/, key/*override*/, delAble = false) {
        this.owner = null;
        this.showName = showName;
        this.key = key;
        this.delAble = delAble;
        this.valueMap = {
            //name: name
        };
        this.dom = null;
    }

    /**
     * 向元素添加属性
     * · 储存形式：
     * |    this.valueMap={
     * |        [key]:{
     * |            subComp:{new SubComponent()},
     * |            showName:[showName]    
     * |        }
     * |    }
     * · 例子：
     * |    this.valueMap={
     * |        fontColor:{
     * |            subComp:{new SubComponent()},
     * |            showName:"字体颜色"    
     * |        }
     * |    }
     * · 注意这里的key用来寻址和记忆，showName在文档中显示
     * @param {string} key 添加的属性名
     * @param {string} showName 属性显示在屏幕上的中文名
     * @param {SubComponent} subComp 添加的属性绑定的subcomponent
     */
    addValue(key, showName, subComp) {
        if (!this.valueMap[key]) {
            this.valueMap[key] = {
                subComp: subComp,
                showName: showName
            };
            subComp.owner = this;
        } else {
            console.error(`尝试添加subcomponent键值对失败`)
            console.error(`属性${key}已存在`);
        }
    }

    /**
     * 获取属性
     * @param {string} key 要获取的值的属性名
     * @returns any
     */
    getValue(key) {
        if (this.valueMap[key]) {
            return this.valueMap[key].subComp.getValue();
        } else {
            console.error(`尝试读取subcomponent键值对失败`)
            console.error(`没有找到属性${key}`);
        }
    }

    /**
     * 设置指定属性的值
     * @param {string} key 属性名
     * @param {any} newValue 要设置的属性值
     */
    setValue(key, newValue) {
        if (this.valueMap[key]) {
            this.valueMap[key].subComp.setValue(newValue);
        } else {
            console.error(`尝试设置subcomponent键值对失败`)
            console.error(`属性${key}不存在`);
        }
    }

    /**
     * 转为HTML
     */
    initHtml() {
        this.dom = document.createElement("div");
        this.dom.classList = "compPan";

        let domTitle = document.createElement("div");
        domTitle.classList = "compPanTitle";

        let domTitleInnerText = document.createElement("p");
        domTitleInnerText.classList = "compPanTitleText"
        domTitleInnerText.innerText = this.showName;

        domTitle.appendChild(domTitleInnerText);

        if (this.delAble) {
            let domTitleDeleteBtn = document.createElement("p");
            domTitleDeleteBtn.classList = "compPanDeleteBtn fa fa-close";
            domTitle.appendChild(domTitleDeleteBtn);
            domTitleDeleteBtn.addEventListener("click", () => {
                this.owner.removeComponent(this);
            })
        }

        this.dom.appendChild(domTitle);

        for (let key in this.valueMap) {
            let value = this.valueMap[key];

            let domPropertyContainer = document.createElement("div");
            domPropertyContainer.classList = "compPanPropertyContainer";

            let domPropertyKey = document.createElement("p");
            domPropertyKey.classList = "compPanPropertyKey";
            domPropertyKey.innerText = value.showName;

            let domPropertyValue = value.subComp.initHtml();

            domPropertyContainer.appendChild(domPropertyKey);
            domPropertyContainer.appendChild(domPropertyValue);

            this.dom.appendChild(domPropertyContainer);
        }
        return this.dom;
    }

    /**
     * 转为JsonObject
     */
    toJsonObj() {
        let jsonObj = {};
        for (let key in this.valueMap) {
            jsonObj[key] = this.valueMap[key].subComp.getValue();
        }
        return jsonObj;
    }
}

import {
    SC_NumberInput,
    SC_ColorInput,
    SC_Divider,
    SC_TextInput,
    SC_Select,
    SC_Vector2,
    SC_UrlInput,
    SC_Check
} from "./subComponent";

/**
 * 节点的外观属性
 */
export class C_N_Exterior extends Component {
    constructor(showName, key, value = {
        size: { x: 10, y: 1 },
        sizeAuto: true,
        shape: "circle",
        dividerColor: "null",
        bgColor: "#000f00",
        dividerStroke: null,
        strokeColor: "#ffd500",
        strokeStyle: "line",
        strokeWidth: 1
    }) {
        super(showName, key, false);
        this.addValue("size", "大小", new SC_Vector2(value.size, false));
        this.addValue("sizeAuto", "自适应", new SC_Check(true, false));
        this.addValue("shape", "形状", new SC_Select(value.shape, false, {
            "circle": "圈圈",
            "rect": "方块"
        }))
        this.addValue("dividerColor", null, new SC_Divider());
        this.addValue("bgColor", "背景颜色", new SC_ColorInput(value.bgColor, false));
        this.addValue("dividerStroke", null, new SC_Divider());
        this.addValue("strokeColor", "描边颜色", new SC_ColorInput(value.strokeColor, false));
        this.addValue("strokeStyle", "描边样式", new SC_Select(value.strokeStyle, false, {
            "line": "_______",
            "dot": "......",
        }));
        this.addValue("strokeWidth", "描边宽度", new SC_NumberInput(value.strokeWidth, false, 0, 100));
    }
}

/**
 * 关系的外观属性
 */
export class C_E_Exterior extends Component {
    constructor(showName, key, value = {
        strokeColor: "#666666",
        strokeStyle: "line",
        strokeWidth: 0.3
    }) {
        super(showName, key, false);
        this.addValue("strokeColor", "描边颜色", new SC_ColorInput(value.strokeColor, false));
        this.addValue("strokeStyle", "描边样式", new SC_Select(value.strokeStyle, false, {
            "line": "_______",
            "dot": "......",
        }));
        this.addValue("strokeWidth", "描边宽度", new SC_NumberInput(value.strokeWidth, false, 0, 100));
    }
}

/**
 * 节点的物理属性
 */
export class C_N_Physics extends Component {
    constructor(showName, key, value = {
        dividerCollision: null,
        collisionRadius: 10,
        dividerManyBodyForce: null,
        manyBodyForceStrength: 80,
        manyBodyForceRangeMin: 10,
        manyBodyForceRangeMax: 112,
        dividerPosition: null,
        position: { x: 0, y: 0 }
    }) {
        super(showName, key, false);
        this.addValue("dividerCollision", "▼碰撞", new SC_Divider());
        this.addValue("collisionRadius", "碰撞半径", new SC_NumberInput(value.collisionRadius, false, 0, 10000));
        this.addValue("dividerManyBodyForce", "▼引/斥力", new SC_Divider());
        this.addValue("manyBodyForceStrength", "大小", new SC_NumberInput(value.manyBodyForceStrength, false, -Infinity, Infinity));
        this.addValue("manyBodyForceRangeMin", "最小范围", new SC_NumberInput(value.manyBodyForceRangeMin, false, 0, Infinity));
        this.addValue("manyBodyForceRangeMax", "最大范围", new SC_NumberInput(value.manyBodyForceRangeMax, false, 0, Infinity));
        this.addValue("dividerPosition", "", new SC_Divider());
        this.addValue("position", "位置", new SC_Vector2(value.position, true));
    }
}

/**
 * 关系的物理属性
 */
export class C_E_Physics extends Component {
    constructor(showName, key, value = {
        linkStrength: 0.8,
        linkDistance: 400
    }) {
        super(showName, key, false);
        this.addValue("linkStrength", "弹簧张力", new SC_NumberInput(value.linkStrength, false, 0, 10000));
        this.addValue("linkDistance", "弹簧长度", new SC_NumberInput(value.linkDistance, false, 0, 10000));
    }
}

/**
 * 节点的外部链接属性
 */
export class C_N_Link extends Component {
    constructor(showName, key, value = {
        url: "http://vezzzing.cn/vezzzingsLibrary/dist/main.html",
        openOuter: true
    }) {
        super(showName, key, true);
        this.addValue("url", "外部链接", new SC_UrlInput(value.url, false));
        this.addValue("openOuter", "新页打开", new SC_Check(value.openOuter, false));
    }
}

/**
 * 节点的文本属性
 */
export class C_N_Text extends Component {
    constructor(showName, key, value = {
        showText: "VEZZ",
        textColor: "#ffffff",
        textSize: 4,
        textSpacing: 0,
        textWeight: 5
    }) {
        super(showName, key, true);
        this.addValue("showText", "文本", new SC_TextInput(value.showText, false));
        this.addValue("textColor", "文字颜色", new SC_ColorInput(value.textColor, false));
        this.addValue("textSize", "文字大小", new SC_NumberInput(value.textSize, false, 0, Infinity));
        this.addValue("textSpacing", "字间距", new SC_NumberInput(value.textSpacing, false, 0, Infinity));
        this.addValue("textWeight", "字体粗细", new SC_NumberInput(value.textWeight, false, 0, 10));
    }
}

/**
 * 节点的音效属性
 */
export class C_N_Audio extends Component {
    constructor(showName, key, value = {
        soundVolume: 1
    }) {
        super(showName, key, true);
        this.addValue("soundVolume", "音量", new SC_NumberInput(value.soundVolume, false, 0, 1, 0.1));
    }
}

/**
 * 节点悬停缩放组件
 */
export class C_N_ScaleHover extends Component {
    constructor(showName, key, value = {
        scale: 1.2,
        scaleTime: 0.5
    }) {
        super(showName, key, true);
        this.addValue("scale", "缩放大小", new SC_NumberInput(value.scale, false, 0, 1000, 0.1));
        this.addValue("scaleTime", "缩放时间", new SC_NumberInput(value.scaleTime, false, 0, 1000, 0.1));
    }
}

/**
 * 寻址映射
 */
export const ComponentMap = {
    "exterior_node": {
        key: "exterior_node",
        type: "node",
        showName: "外观",
        class: C_N_Exterior,
    },
    "physics_node": {
        key: "physics_node",
        type: "node",
        showName: "物理",
        class: C_N_Physics,
    },
    "link_node": {
        key: "link_node",
        type: "node",
        showName: "外链",
        class: C_N_Link,
    },
    "text_node": {
        key: "text_node",
        type: "node",
        showName: "文本",
        class: C_N_Text,
    },
    "exterior_edge": {
        key: "exterior_edge",
        type: "edge",
        showName: "外观",
        class: C_E_Exterior,
    },
    "physics_edge": {
        key: "physics_edge",
        type: "edge",
        showName: "物理",
        class: C_E_Physics,
    },
    "audio_node": {
        key: "audio_node",
        type: "node",
        showName: "悬停音效",
        class: C_N_Audio,
    },
    "scaleHover_node": {
        key: "scaleHover_node",
        type: "node",
        showName: "悬停缩放",
        class: C_N_ScaleHover,
    }
}

/**
 * @param {string} key component的寻址key
 * @param {object} valueObj 储存component值的对象 
 */
export function LoadComponentFromJson(key, valueObj) {
    if (ComponentMap[key]) {
        return new ComponentMap[key].class(ComponentMap[key].showName, key, valueObj);
    } else {
        console.error(`类${key}未定义`)
    }
}