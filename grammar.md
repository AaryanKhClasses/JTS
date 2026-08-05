# JTS Grammar
JTS is a Typescript to Java transpiler. The grammar of JTS is similar to Typescript. The following is a list of the grammar rules that JTS supports.

## Variable Declaration
1. Untyped `let` declaration
```ts
let x = 5
```
to
```java
var x = 5
```

2. Untyped `const` declaration
```ts
const x = 5
```
to
```java
final var x = 5
```

3. Typed `let` declaration
```ts
let x: number = 5
```
to
```java
int x = 5
```

4. Typed `const` declaration
```ts
let x: string = "Hello"
```
to
```java
final String x = "Hello"
```

## Console Log
1. `console.log` statement
```ts
console.log("Hello World")
```
to
```java
System.out.println("Hello World")
```

2. `console.error` statement
```ts
console.error("Error Message")
```
to
```java
System.err.println("Error Message")
```
