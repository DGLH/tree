export default class Tree {
    selected: string = '';
    selectKey: string = '';
    change?: (selected: string[]) => void;

    constructor(change?: (selected: string[]) => void) {
        if (change) {
            this.change = change;
        }
    }

    add(select: string, selectKey: string) {
        this.selected += '&' + select + '&';

        this.selectKey += '&' + selectKey + '&';
    }

    sub(select: string, selectKey: string) {
        this.selected = this.selected.replace('&' + select + '&', '');

        this.selectKey = this.selectKey.replace('&' + selectKey + '&', '');
    }

    triggerChange() {
        if (this.change) {
            this.change(this.getValue());
        }
    }

    reset() {
        this.selectKey = '';
        this.selected = '';
    }

    getValue() {
        return this.selected.split('&').filter((item) => item);
    }
}
