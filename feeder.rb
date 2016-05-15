# rubocop:disable Style/GlobalVars
# rubocop:disable Metrics/MethodLength

require 'redis'
require 'oj'
# require 'pry'

# $filename = '/Users/praphan/Desktop/projects/Redis/100lines.json'
$filename = '/Users/praphan/Desktop/projects/Redis/md-message1-20160308.log'
$redis = Redis.new(path: '/tmp/redis.sock', driver: :hiredis)
$cnt = 0
$chunksize = 700

now = Time.new
puts Time.new.strftime('%H:%M:%S.%3N')

def save(tmp)
  $redis.pipelined do
    id = $cnt < $chunksize ? 1 : $cnt - $chunksize
    tmp.each_with_index do |item, index|
      keys = item.keys
      $redis.hmset("logs:#{id + index}",
                   'id', id + index,
                   'seqNo', item['seqNo'],
                   'mesgType', item['mesgType'],
                   'msg', (keys.length > 2 ? item[keys[2]] : ''))
    end
  end
end

def feed
  tmp = []
  File.open($filename).each_line do |line|
    $cnt += 1
    tmp << Oj.load(line)
    if $cnt % $chunksize == 0
      save(tmp)
      tmp = []
    end
  end
  # binding.pry
  save(tmp)
  $redis.set('logs:size', $cnt)
end

# feed
feed

puts $cnt
puts Time.new - now
puts Time.new.strftime('%H:%M:%S.%3N')
