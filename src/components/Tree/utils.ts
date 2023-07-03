export const trigger = (element: any, defaultState = false) => {
    let timer: number | undefined = undefined;
    // 当前是展开还是收起状态 true false 是收起状态
    let state = defaultState;

    return () => {
        if (timer) return;
        // 如果当前 state 值为 true，就标识当前是展开，接下来要进行的是收起操作
        if (state) {
            state = false;
            // 获取 offsetHeight
            let height = element.offsetHeight;
            const stepHeight = height / 30;

            timer = setInterval(() => {
                height -= stepHeight;
                if (height <= 0) {
                    // 高度小于等于 0 代表动画完成，将数据进行重置
                    clearInterval(timer);
                    timer = undefined;
                    element.style.height = null;
                    element.style.display = 'none';
                    return;
                }
                element.style.height = height + 'px';
            }, 10);
        } else {
            // 获取元素总高度
            element.style.display = 'block';
            state = true;
            let height = 0;
            // 获取 offsetHeight
            const offsetHeight = element.offsetHeight;
            const stepHeight = offsetHeight / 30;

            element.style.height = height + 'px';

            timer = setInterval(() => {
                height += stepHeight;
                if (height >= offsetHeight) {
                    clearInterval(timer);
                    timer = undefined;
                    element.style = null;
                    return;
                }
                element.style.height = height + 'px';
            }, 10);
        }
    };
};
