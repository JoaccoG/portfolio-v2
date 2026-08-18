declare module 'idiomorph' {
	export interface IdiomorphCallbacks {
		beforeNodeAdded?: (node: Node) => boolean | undefined;
		afterNodeAdded?: (node: Node) => void;
		beforeNodeMorphed?: (oldNode: Node, newNode: Node) => boolean | undefined;
		afterNodeMorphed?: (oldNode: Node, newNode: Node) => void;
		beforeNodeRemoved?: (node: Node) => boolean | undefined;
		afterNodeRemoved?: (node: Node) => void;
		beforeAttributeUpdated?: (
			attributeName: string,
			node: Element,
			mutationType: 'update' | 'remove',
		) => boolean | undefined;
	}

	export interface IdiomorphOptions {
		morphStyle?: 'innerHTML' | 'outerHTML';
		ignoreActive?: boolean;
		ignoreActiveValue?: boolean;
		restoreFocus?: boolean;
		head?: { style?: 'merge' | 'append' | 'morph' | 'none' };
		callbacks?: IdiomorphCallbacks;
	}

	export const Idiomorph: {
		morph(
			oldNode: Element | Document,
			newContent: Element | Document | string,
			options?: IdiomorphOptions,
		): Node[];
	};
}
