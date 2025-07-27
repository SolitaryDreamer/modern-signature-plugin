# Readme

This is a handwritten signature plugin developed using TypeScript+TailwindCSS. Here is the 

[demo]:https://SolitaryDreamer.github.io/modern-signature-plugin/ .
You can install it in your own project using the following command:

```bash
npm i modern-signature-plugin
```

To enable Tailwind styles, please import the styles from the plugin into your main CSS file:

```bash
@source "../node_modules/modern-signature-plugin";
```

Then you will have a fully functional handwritten signature component. 

Here's how to use this plugin:

```typescript
<SignaturePad
	width={500}
	height={300}
	initialStrokeColor="#000000"
	initialStrokeWidth={2} // 1-10
	backgroundColor="transparent" // transparent | black | white
/>
```

The code above contains the default options. You can change them or omit these options.
