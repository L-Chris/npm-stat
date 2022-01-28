const dayjs = require('dayjs')
const Crawler = require('crawler')
const fs = require('fs')

const packages = ['react', 'vue', 'jquery', 'angular', 'svelte', 'solid', 'preact', 'backbone', '']
const startMonth = '2012-01'
const endMouth = '2022-01'

const getRanges = () => {
    const startDate = dayjs(startMonth)
    const endDate = dayjs(endMouth)
    let date = startDate
    const res = []

    while(date.isBefore(endDate) || date.isSame(endDate)) {
        res.push({
            start: date.format('YYYY-MM-DD'),
            end: date.add(1, 'month').subtract(1, 'day').format('YYYY-MM-DD')
        })
        date = date.add(1, 'month')
    }

    return res
}

const ranges = getRanges()

const getAllCount = (name) => {
    const crawler = new Crawler({
        maxConnections: 10,
        incomingEncoding: 'utf-8',
        jQuery: false,
      });

    const result = []

    const tasks = ranges.map((_, i) => {
        return {
            uri: `https://api.npmjs.org/downloads/point/${_.start}:${_.end}/${name}`,
            callback(err, res, done) {
                if (err) {
                    return done()
                }

                const data = JSON.parse(res.body)

                if (data.error) {
                    result.push({
                        id: i,
                        downloads: 0,
                        start: _.start,
                        end: _.end,
                        name
                    })
                    return done()
                }

                result.push({
                    id: i,
                    downloads: data.downloads,
                    start: _.start,
                    end: _.end,
                    name
                })
                return done()
            }
        }
    })

    crawler.queue(tasks)
    crawler.on('drain', () => {
        const data = result.sort((a, b) => a.id - b.id)
        fs.writeFileSync(`${name}.json`, JSON.stringify(data))
      });
}

getAllCount('vue')