# 编程题示例

## 第一题

请分析以下JavaScript代码的输出结果：

```javascript
function example() {
    let x = 1;
    let y = 2;
    console.log(x + y);
    return x * y;
}
example();
```

A. 3, 2
B. 2, 3  
C. 输出3，返回2
D. 输出2，返回3

**答案：C**

**解析：** 
代码中首先执行 `console.log(x + y)`，输出 1+2=3，然后返回 x*y = 1*2 = 2。

## 第二题

以下Python代码的作用是什么？

```python
def fibonacci(n):
    if n <= 1:
        return n
    else:
        return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(5))
```

这是一个递归实现的斐波那契数列函数。

**答案：** 计算第5个斐波那契数，输出结果为5。