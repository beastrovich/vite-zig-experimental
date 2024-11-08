struct Uniforms {
    viewport: vec2f,
    particleSize: f32,
    // _padding: f32,
    // boxBounds: vec4f,
};

struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) velocity: vec2f,
    @location(1) quadPos: vec2f,
};

@binding(0) @group(0) var<uniform> uniforms: Uniforms;

@vertex
fn vertex_main(
    @location(0) position: vec2f,
    @location(1) velocity: vec2f,
    @builtin(vertex_index) vertexIndex: u32
) -> VertexOutput {
    var output: VertexOutput;
    
    let quadVertices = array<vec2f, 6>(
        vec2f(-1.0, -1.0),
        vec2f( 1.0, -1.0),
        vec2f( 1.0,  1.0),
        vec2f(-1.0, -1.0),
        vec2f( 1.0,  1.0),
        vec2f(-1.0,  1.0)
    );
    
    let quadPos = quadVertices[vertexIndex];
    
    // Calculate aspect ratio correction factors
    let aspectRatio = uniforms.viewport.x / uniforms.viewport.y;
    // let scaleX = min(1.0, aspectRatio);
    // let scaleY = min(1.0, 1.0 / aspectRatio);
    
    let unitX = 2.0 / uniforms.viewport.x;
    let unitY = 2.0 / uniforms.viewport.y;

    // Convert position to normalized device coordinates
    var pos = position;
    // pos = (pos - uniforms.boxBounds.xy) / (uniforms.boxBounds.zw - uniforms.boxBounds.xy) * 2.0 - 1.0;
    // Apply particle size with aspect ratio correction
    let particleSize = uniforms.particleSize;
    let scaledQuadPos = quadPos * particleSize / 2;

    pos += vec2f(
        scaledQuadPos.x,
        scaledQuadPos.y
    );

    pos *= vec2f(unitX, unitY);
    
    
    output.position = vec4f(pos, 0.0, 1.0);
    output.velocity = velocity;
    output.quadPos = quadPos;
    
    return output;
}

@fragment
fn fragment_main(
    @location(0) velocity: vec2f,
    @location(1) quadPos: vec2f
) -> @location(0) vec4f {
    // Enforce perfectly circular shape
    let distanceFromCenter = length(quadPos);
    if (distanceFromCenter > 1.0) {
        discard;
    }
    
    let speed = length(velocity);
    let restColor = vec3f(0.0, 0.0, 0.0);
    let movingColor = vec3f(1.0, 1.0, 1.0);
    let rgb = mix(restColor, movingColor, speed / 0.1);
    
    return vec4f(movingColor, 1.0); // vec4f(rgb, 1.0);
}