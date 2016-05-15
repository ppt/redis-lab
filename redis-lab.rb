# rubocop:disable Style/For, Style/FileName, Metrics/LineLength
require 'redis'

filename = '/Users/praphan/Desktop/projects/Redis/100lines.json' # rubocop:disable Lint/UselessAssignment

redis = Redis.new(path: '/tmp/redis.sock', driver: :hiredis)
now = Time.new

def hash(redis)
  redis.hmset('hash', 'f1', 'xxx', 'f2', 'xxx')
end

def speed_chunk(redis)
  for i in 1..10_000
    redis.multi do
      for j in 1..500
        redis.hmset("logs:#{i * 500 + j}", 'f1', 'xxx', 'f2', 'xxx')
      end
    end
  end
end

def speed(redis)
  for i in 1..1_000_000
    redis.hmset("logs:#{i}", 'f1', 'xxx', 'f2', 'xxx')
  end
end

speed_chunk(redis)
# speed(redis)

puts Time.new - now
