export default class Tree {
    // 选中的结果，结果是传递的 key 值
    selected: string = '';
    // change 事件，在初始化时传递
    change?: (selected: string[]) => void;

    constructor(change?: (selected: string[]) => void) {
        if (change) {
            this.change = change;
        }
    }

    add(select: string) {
        this.selected += '&' + select + '&';
    }

    sub(select: string) {
        this.selected = this.selected.replace('&' + select + '&', '');
    }
    // 触发 change 事件
    triggerChange() {
        if (this.change) {
            this.change(this.getValue());
        }
    }

    reset() {
        this.selected = '';
    }

    getValue() {
        return this.selected.split('&').filter((item) => item);
    }
}
