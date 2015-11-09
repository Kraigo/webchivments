'use strict';
function getAchievments(stats) {
	var achievments = [
		new Achievment(stats, {
			id: 0,
			material: 'gold',
			title: 'Добро пожаловать',
			description: 'Установить расширение Webchievment',
			relation: 'path',
			target: 0
		}),
		new Achievment(stats, {
			id: 1,
			material: 'gold',
			title: 'Сразу в бой',
			description: 'Получить больше одного достижения',
			relation: function() {
				return this.stats.achievmentsFired.length;
			},
			target: 2
		}),
		new Achievment(stats, {
			id: 2,
			material: 'gold',
			title: 'Твои первые шаги',
			description: 'Пройти путь в 1,000,000 пикселей',
			relation: 'path',
			target: 1000000
		}),
		new Achievment(stats, {
			id: 4,
			material: 'gold',
			title: 'От Земли до Луны',
			description: '384,467 километров (145,300,715,840 пкс при 96 ppi)',
			relation: 'path',
			target: 145300715840
		}),
		new Achievment(stats, {
			id: 5,
			material: 'gold',
			title: 'Освоить клавиатуру',
			description: 'Нажать 1,000 кнопок',
			relation: 'presses',
			target: 1000
		}),
		new Achievment(stats, {
			id: 6,
			material: 'gold',
			title: 'Расширить кругозор',
			description: 'Открыть 100 новых вкладок',
			relation: 'pages',
			target: 100
		}),
		new Achievment(stats, {
			id: 7,
			material: 'gold',
			title: 'Полезная прогулка',
			description: 'Пройти 3,000 метров (96dpi)',
			relation: function() {
				return this.stats.path / (96 / 0.0254);
			},
			target: 3000,
		}),
		new Achievment(stats, {
			id: 7,
			material: 'gold',
			title: 'Властелин достижений',
			description: 'Собрать ВСЕ достижения',
			relation: function() {
				return this.stats.achievmentsFired.length;
			},
			target: function() {
				return achievments.length;
			}
		})
	]

	return achievments;
};


function Achievment(stats, options, trigger) {
	this.stats = stats;	

	this.id = options.id;
	this.material = options.material || 'regular';
	this.icon = options.icon || 'icon-48.png';
	this.title = options.title || 'Достижение';
	this.description = options.description || 'Описание';

	this.relation = options.relation;
	this.target = options.target;

	if (trigger) this.trigger = trigger;
}

Achievment.prototype = {
	current: function() {
		return (typeof this.relation == 'function') ? this.relation.apply(this) : this.stats[this.relation];
	},
	done: function() {
		return (typeof this.target == 'function') ? this.target.apply(this) : this.target;
	},
	trigger: function () {
		return this.current() >= this.done();
	},
	progress: function() {
		var progress = this.current() / this.done() * 100;
		return progress < 100 ? progress : 100;
	},
	isFired: function() {
		return this.stats.achievmentsFired.indexOf(this.id) >= 0;
	},
	isRecent: function() {
		return this.stats.achievmentsRecent.indexOf(this.id) >=0;
	}
}