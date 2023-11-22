import * as path from 'path';
import * as Mocha from 'mocha';
import { glob, globIterate } from 'glob';
import { Glob } from 'glob';
// import * as glob from 'glob';

export function run(): Promise<void> {
	// Create the mocha test
	const mocha = new Mocha({
		ui: 'tdd',
		color: true
	});

	const testsRoot = path.resolve(__dirname, '..');

	return new Promise((c, e) => {
		const g = new Glob('**/**.test.js', { cwd: testsRoot });
		for (const file of g) {
			// Add files to the test suite
			mocha.addFile(path.resolve(testsRoot, file));
		};
		try {
			// Run the mocha test
			mocha.run(failures => {
				if (failures > 0) {
					e(new Error(`${failures} tests failed.`));
				} else {
					c();
				}
			});
		} catch (err) {
			console.error(err);
			e(err);
		}
	});
}
