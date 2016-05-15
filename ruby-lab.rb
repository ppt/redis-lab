# rubocop:disable all

require 'json'
require 'oj'
require 'set'
require 'PP'
# require 'pry'

$filename = "/Users/praphan/Desktop/projects/Redis/md-message1-20160308.log"
$cnt = 0
$last = ''
now = Time.new
# binding.pry

def readall
    buf = IO.readlines($filename)
    for line in buf do
        # Oj.load(line)
    end
    $cnt = buf.length
end

def readall_chunk
    chunksize = 30
    buf = IO.readlines($filename)
    $cnt = buf.length
    i=0
    while i < $cnt
        if i + chunksize > $cnt
            j = chunksize - 1
        else
            j = i + chunksize
        end
        Oj.load('['+buf[i..j].join(',')+']')
        i += chunksize
    end
end

def parse_chunk_oj
    buf = '['
    chunksize = 5
    File.open($filename).each_line do |line|
        $cnt += 1
        if $cnt % chunksize == 1
            buf << line
        elsif $cnt % chunksize == 0
            Oj.load(buf+','+line+']')
            buf = '['
        else
            buf << ','
            buf << line
        end
    end

    if (buf.length > 0)
        Oj.load(buf+']')
    end
end

def parse_chunk_join_oj
    buf = []
    chunksize = 300
    File.open($filename).each_line do |line|
        $cnt += 1
        buf.push(line)
        if $cnt % chunksize == 0
            Oj.load('['+buf.join(',')+']')
            buf = []
        end
    end

    if (buf.length > 0)
        Oj.load('['+buf.join(',')+']')
    end
end

def parse_1line_oj
    File.open($filename).each_line do |line|
        $cnt += 1
        Oj.load(line)
    end
end

def parse_1line_JSON
    File.open($filename).each_line do |line|
        $cnt += 1
        JSON.parse(line)
    end
end

def scan
    cmdset = Set.new
    File.open($filename).each_line do |line|
        $cnt += 1
        o = Oj.load(line)
        keys = o.keys
        if keys.length > 3 or keys[0] != 'seqNo' or keys[1] != 'mesgType'
            console.log "#{$cnt} : #{line}"
        end
        if keys.length == 3
            cmdset.add keys[2]
        elsif o['mesgType'] != 'NotApplicable'
            console.log "#{$cnt} : #{line}"
        end
    end
    pp cmdset
end

# parse_1line_JSON()
# parse_1line_oj()
# parse_chunk_join_oj()
# readall()
# readall_chunk()
scan

pp $cnt
puts (Time.new - now)
